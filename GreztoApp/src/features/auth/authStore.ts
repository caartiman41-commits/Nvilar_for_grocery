import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '../../api/client';
import { useSellerStore } from '../seller/sellerStore';

// FCM Token helper — returns token if @react-native-firebase/messaging is available
const getFCMToken = async (): Promise<string | null> => {
  try {
    const { getMessaging, getToken, registerDeviceForRemoteMessages } = require('@react-native-firebase/messaging');
    if (typeof getMessaging === 'function') {
      const messagingInstance = getMessaging();
      if (typeof registerDeviceForRemoteMessages === 'function') {
        await registerDeviceForRemoteMessages(messagingInstance).catch(() => {});
      }
      if (typeof getToken === 'function') {
        const token = await getToken(messagingInstance);
        return token || null;
      }
    }
  } catch (err: any) {
    console.log('[authStore] FCM token retrieval skipped:', err?.message || err);
  }
  return null;
};

export interface User {
  uid: string;
  phoneNumber: string | null;
  displayName?: string | null;
  email?: string | null;
  role?: string;
  sellerStatus?: 'none' | 'under_review' | 'pending_review' | 'approved' | 'rejected';
  isSeller?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  setToken: (token: string | null) => void;
  setHydrated: (isHydrated: boolean) => void;
  syncUserWithBackend: (userData?: Partial<User> & { action?: 'login' | 'create' }) => Promise<User | null>;
  loginWithTruecaller: (profile: { phoneNumber: string; displayName?: string; authCode?: string; action?: 'login' | 'create' }) => Promise<User>;
  loginWithFirebase: (profile: { uid: string; phoneNumber: string; displayName?: string; action?: 'login' | 'create' }) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: (isHydrated) => set({ isHydrated }),

      setUser: (user, token) =>
        set({
          user,
          token: token !== undefined ? token : get().token,
          isAuthenticated: !!user,
        }),

      setToken: (token) => set({ token }),

      syncUserWithBackend: async (userData) => {
        const currentUser = get().user;
        const targetUser = userData || currentUser;
        if (!targetUser) return null;

        const uid = targetUser.uid || `usr_${Date.now()}`;
        const phone = targetUser.phoneNumber || '';
        const name = targetUser.displayName || 'Mitreno Member';
        const action = (userData as any)?.action || 'login';

        try {
          // Acquire FCM device token for push notification registration
          const fcmToken = await getFCMToken();

          const payload = {
            action,
            firebase_uid: uid,
            phone: phone,
            full_name: name,
            fcm_token: fcmToken || '',
          };

          const res = await apiClient.post('/auth/sync', payload, {
            headers: {
              'X-User-ID': uid,
            },
          });

          if (res.data?.user) {
            const isSellerAccount = res.data.is_seller || res.data.user.role === 'seller';
            const sellerStat = res.data.seller_status || (isSellerAccount ? 'approved' : 'none');

            const synced: User = {
              uid: res.data.user.id || res.data.user_id || uid,
              phoneNumber: res.data.user.phone || phone,
              displayName: res.data.user.full_name || name,
              email: res.data.user.email || null,
              role: res.data.user.role || (isSellerAccount ? 'seller' : 'customer'),
              sellerStatus: sellerStat,
              isSeller: isSellerAccount,
            };
            set({ user: synced, isAuthenticated: true });

            // Automatically sync seller store
            try {
              if (isSellerAccount || sellerStat === 'approved') {
                useSellerStore.getState().approveApplication();
              } else if (sellerStat === 'pending_review' || sellerStat === 'under_review') {
                useSellerStore.setState({
                  applicationStatus: 'under_review',
                  hasSubmittedApplication: true,
                });
              } else {
                useSellerStore.getState().resetApplication();
              }
            } catch {}

            // Automatically sync saved delivery addresses for this user/phone
            try {
              const { useCheckoutStore } = require('../checkout/checkoutStore');
              useCheckoutStore.getState().fetchAddressesFromBackend(synced.phoneNumber);
            } catch {}

            return synced;
          }
        } catch (err: any) {
          const status = err?.response?.status;
          const code = err?.response?.data?.code;
          const errMsg = err?.response?.data?.error || err?.message;

          // Fail-closed on Gatekeeper conflicts: DO NOT create a phantom local session!
          if (status === 409 || code === 'PHONE_ALREADY_REGISTERED') {
            throw new Error('This phone number is already registered. Please Sign In.');
          }
          if (status === 404 || code === 'ACCOUNT_NOT_FOUND') {
            throw new Error('No account found with this phone number. Please Create an Account first.');
          }

          console.warn('[AUTH SYNC] Go backend error:', errMsg);
          throw err;
        }

        return null;
      },

      loginWithTruecaller: async ({ phoneNumber, displayName, authCode, action }) => {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        const uid = `tc_${cleanPhone.replace('+', '')}`;
        const name = displayName || 'Mitreno Member';

        const user = await get().syncUserWithBackend({
          uid,
          phoneNumber: cleanPhone,
          displayName: name,
          action: action || 'login',
        } as any);

        if (!user) {
          throw new Error('Authentication failed');
        }
        return user;
      },

      loginWithFirebase: async ({ uid, phoneNumber, displayName, action }) => {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        const name = displayName || 'Mitreno Member';

        const user = await get().syncUserWithBackend({
          uid,
          phoneNumber: cleanPhone,
          displayName: name,
          action: action || 'login',
        } as any);

        if (!user) {
          throw new Error('Authentication failed');
        }
        return user;
      },

      logout: () => {
        Keychain.resetGenericPassword();
        try {
          useSellerStore.getState().resetApplication();
          AsyncStorage.removeItem('mitreno-seller-storage');
          AsyncStorage.removeItem('mitreno-auth-storage');
          AsyncStorage.removeItem('grezto-auth-storage');
        } catch {}
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'mitreno-auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (key: string) => {
          const val = await AsyncStorage.getItem(key);
          if (val) return val;
          if (key === 'mitreno-auth-storage') {
            const legacyVal = await AsyncStorage.getItem('grezto-auth-storage');
            if (legacyVal) {
              await AsyncStorage.setItem('mitreno-auth-storage', legacyVal);
              return legacyVal;
            }
          }
          return null;
        },
        setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
        removeItem: (key: string) => AsyncStorage.removeItem(key),
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
