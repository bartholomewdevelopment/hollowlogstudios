import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import {
  loginWithEmail,
  register as registerUser,
  logout as logoutUser,
  resetPassword as resetUserPassword,
  getCurrentUser,
  onAuthChange
} from '@/firebase/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: any;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadUser = async () => {
    try {
      if (isRefreshing) return null;

      setLoading(true);
      setIsRefreshing(true);

      const { user, error } = await getCurrentUser();
      if (error) throw error;
      setUser(user);
      return user;
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Set up Firebase auth state change listener
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        loadUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (isRefreshing) return user;
    return await loadUser();
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await loginWithEmail(email, password);
      if (error) {
        throw error;
      }
      setUser(user);
      return user;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await registerUser(email, password, firstName, lastName);
      if (error) {
        throw error;
      }
      setUser(user);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await logoutUser();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await resetUserPassword(email);
      if (error) throw error;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
