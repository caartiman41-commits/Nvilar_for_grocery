"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { supabase } from "./supabase";

import { apiClient } from "./api-client";

interface AuthContextType {
  user: User | null;
  dbUser: any | null; // Represents the user object from the Go Backend
  isGuest: boolean;
  isLoading: boolean;
  skipToGuest: () => void;
  requireAuth: () => void; // Un-skips guest mode to force auth screen
  logout: () => Promise<void>;
  syncWithBackend: (firebaseUser: User, name?: string, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync Firebase User with our Go Backend
  const syncWithBackend = async (firebaseUser: User, name?: string, email?: string) => {
    try {
      const idToken = await firebaseUser.getIdToken();

      // Bridge Firebase ID token to Supabase Realtime client
      if (supabase?.realtime) {
        supabase.realtime.setAuth(idToken).catch((err) => {
          console.warn("[Supabase Realtime] Auth bridge notice:", err);
        });
      }

      const payload: any = {
        phone: firebaseUser.phoneNumber,
      };
      if (name) payload.full_name = name;
      if (email) payload.email = email;

      const data = await apiClient.post('/api/auth/sync', payload);
      if (data.success) {
        setDbUser(data.user || {});
        if (data.token) {
          localStorage.setItem("mitreno_session", data.token);
        }
      } else {
        console.warn("Backend user sync notice:", data.error || data.message);
      }
    } catch (error) {
      console.error("Error syncing with backend:", error);
    }
  };

  useEffect(() => {
    if (!auth) {
      // Mock mode / gracefully handle missing Firebase config
      console.warn("Auth context: Firebase auth is not initialized. Running in guest/mock mode.");
      setIsGuest(true);
      setIsLoading(false);
      return;
    }

    // Safety fallback: ensure page never stays stuck on "Loading..." indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(safetyTimer);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        // Non-blocking sync with backend (UI shows instantly)
        syncWithBackend(firebaseUser).catch((err) => {
          console.warn("Backend sync notice:", err);
        });
      } else {
        setUser(null);
        setDbUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const skipToGuest = () => {
    setIsGuest(true);
  };

  const requireAuth = () => {
    setIsGuest(false);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    if (supabase?.realtime) {
      supabase.realtime.setAuth(null).catch(() => {});
    }
    setUser(null);
    setDbUser(null);
    setIsGuest(false); // Reset guest mode on logout so they see auth screen again
    if (typeof window !== "undefined") {
      localStorage.removeItem("mitreno_session");
      localStorage.removeItem("mitreno_seller_status");
      localStorage.removeItem("mitreno_seller_app_id");
      localStorage.removeItem("mitreno_seller_applications");
      localStorage.removeItem("mitreno_seller_has_visited");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isGuest,
        isLoading,
        skipToGuest,
        requireAuth,
        logout,
        syncWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
