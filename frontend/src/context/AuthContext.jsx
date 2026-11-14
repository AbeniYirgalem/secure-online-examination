import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user profile on application startup
  const checkAuth = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data?.data?.user) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      // User is unauthenticated or session expired; clear state silently
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle user authentication (login)
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  // Handle student registration
  const register = async (studentData) => {
    const res = await authService.register(studentData);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  // Handle session termination (logout)
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
