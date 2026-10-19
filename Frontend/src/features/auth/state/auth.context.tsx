import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../../shared/types/index';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('school_erp_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_erp_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('school_erp_token', token);
    } else {
      localStorage.removeItem('school_erp_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('school_erp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('school_erp_user');
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        setUser,
        setToken,
        setIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthState = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};
