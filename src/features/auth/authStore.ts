import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '../../api/client';
import { useSellerStore } from '../seller/sellerStore';

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
  setUser: (user: User | null, token?: string | null) => void;
  setToken: (token: string | null) => void;
  syncUserWithBackend: (userData?: Partial<User>) => Promise<User | null>;
  loginWithTruecaller: (profile: { phoneNumber: string; displayName?: string; authCode?: string }) => Promise<User>;
  loginWithFirebase: (profile: { uid: string; phoneNumber: string; displayName?: string }) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

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
        const name = targetUser.displayName || 'Grezto Member';

        try {
          const payload = {
            firebase_uid: uid,
            phone: phone,
            full_name: name,
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
              }
            } catch {}

            return synced;
          }
        } catch (err) {
          console.warn('[AUTH SYNC] Go backend offline or error, using local verified session:', err);
        }

        const localUser: User = {
          uid,
          phoneNumber: phone,
          displayName: name,
          role: 'customer',
          isSeller: false,
          sellerStatus: 'none',
        };
        set({ user: localUser, isAuthenticated: true });
        return localUser;
      },

      loginWithTruecaller: async ({ phoneNumber, displayName, authCode }) => {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        const uid = `tc_${cleanPhone.replace('+', '')}`;
        const name = displayName || 'Grezto Member';

        const user = await get().syncUserWithBackend({
          uid,
          phoneNumber: cleanPhone,
          displayName: name,
        });

        return user || { uid, phoneNumber: cleanPhone, displayName: name };
      },

      loginWithFirebase: async ({ uid, phoneNumber, displayName }) => {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        const name = displayName || 'Grezto Member';

        const user = await get().syncUserWithBackend({
          uid,
          phoneNumber: cleanPhone,
          displayName: name,
        });

        return user || { uid, phoneNumber: cleanPhone, displayName: name };
      },

      logout: () => {
        Keychain.resetGenericPassword();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'grezto-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
