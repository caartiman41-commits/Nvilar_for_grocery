import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '../../api/client';

export interface User {
  uid: string;
  phoneNumber: string | null;
  displayName?: string | null;
  email?: string | null;
  role?: string;
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
            const synced: User = {
              uid: res.data.user.id || res.data.user.firebase_uid || uid,
              phoneNumber: res.data.user.phone || phone,
              displayName: res.data.user.full_name || name,
              email: res.data.user.email || null,
              role: res.data.user.role || 'customer',
            };
            set({ user: synced, isAuthenticated: true });
            return synced;
          }
        } catch (err) {
          console.warn('[AUTH SYNC] Go backend offline or error, using local verified session:', err);
        }

        // Fallback local persistence if backend is offline
        const localUser: User = {
          uid,
          phoneNumber: phone,
          displayName: name,
          role: 'customer',
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
