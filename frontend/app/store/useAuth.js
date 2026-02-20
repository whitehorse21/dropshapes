'use client'
import { useEffect } from 'react';
import { useAuthStore } from '../store';

export const useAuth = () => {
  console.log("auth111")
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
    checkAuth
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    if (!checkAuth() && isAuthenticated) {
      // Token expired but state shows authenticated
      logout();
    }
  }, [checkAuth, isAuthenticated, logout]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearError
  };
};
