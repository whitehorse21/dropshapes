'use client';

import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/authStore';

export interface AuthUser {
  id?: number;
  email?: string;
  username?: string;
  name?: string;
  is_admin?: boolean;
  [key: string]: unknown;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  agree_to_terms?: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => boolean;
  isAdmin: () => boolean;
  getUserRole: () => 'admin' | 'user' | null;
  updateUser: (userData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    isAdmin,
    getUserRole,
    updateUser,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading: loading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    isAdmin,
    getUserRole,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
