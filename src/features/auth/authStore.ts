import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

interface User {
  uid: string;
  phoneNumber: string | null;
  displayName?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    Keychain.resetGenericPassword();
    set({ user: null, isAuthenticated: false });
  },
}));
