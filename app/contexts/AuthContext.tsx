// app/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  appwriteUserId: string | null;
  isSyncing: boolean;
  syncError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const { isSyncing, syncError, appwriteUserId } = useAuthSync();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(isAuthenticated),
        isLoading: Boolean(isLoading),
        appwriteUserId,
        isSyncing,
        syncError,
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
