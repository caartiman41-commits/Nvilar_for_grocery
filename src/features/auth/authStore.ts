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
        if (!currentUser && !userData) return null;
        try {
          const payload = {
            firebase_uid: currentUser?.uid || userData?.uid,
            phone: currentUser?.phoneNumber || userData?.phoneNumber,
            full_name: currentUser?.displayName || userData?.displayName || 'Grezto Member',
          };
          const res = await apiClient.post('/auth/sync', payload);
          if (res.data?.user) {
            const synced: User = {
              uid: res.data.user.id || res.data.user.firebase_uid,
              phoneNumber: res.data.user.phone,
              displayName: res.data.user.full_name,
              email: res.data.user.email,
              role: res.data.user.role,
            };
            set({ user: synced, isAuthenticated: true });
            return synced;
          }
        } catch (err) {
          console.warn('[AUTH SYNC] Offline fallback:', err);
        }
        return currentUser;
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
