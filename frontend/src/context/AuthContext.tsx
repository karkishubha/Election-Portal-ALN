/**
 * Authentication Context
 * Nepal Election Portal Frontend
 * 
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AdminUser } from '@/lib/api';

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    if (!authApi.isLoggedIn()) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success) {
        setAdmin(response.data.admin);
      } else {
        authApi.logout();
        setAdmin(null);
      }
    } catch (error) {
      authApi.logout();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    if (response.success) {
      setAdmin(response.data.admin);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const logout = () => {
    authApi.logout();
    setAdmin(null);
  };

  const value: AuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
