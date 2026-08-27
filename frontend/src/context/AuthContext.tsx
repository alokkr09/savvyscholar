import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/auth.types';
import { authApi } from '../services/authApi';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('savvyscholar_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('savvyscholar_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  // Validate session on load
  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('savvyscholar_token');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('savvyscholar_user', JSON.stringify(response.user));
      }
    } catch (err) {
      // Session invalid or server offline
      console.warn('Session check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('savvyscholar_token', response.token);
      localStorage.setItem('savvyscholar_user', JSON.stringify(response.user));
      success('Welcome back!', `Logged in as ${response.user.name}`);
    } catch (err: any) {
      error('Login Failed', err.message || 'Invalid credentials');
      throw err;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authApi.register(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('savvyscholar_token', response.token);
      localStorage.setItem('savvyscholar_user', JSON.stringify(response.user));
      success('Account Created!', `Welcome to Savvy Scholar, ${response.user.name}`);
    } catch (err: any) {
      error('Registration Failed', err.message || 'Could not create account');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('savvyscholar_token');
    localStorage.removeItem('savvyscholar_user');
    success('Logged Out', 'You have been securely logged out.');
  };

  const updateProfile = async (data: UpdateProfilePayload) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('savvyscholar_user', JSON.stringify(response.user));
        success('Profile Updated', 'Your profile details have been saved.');
      }
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update profile');
      throw err;
    }
  };

  const changePassword = async (data: ChangePasswordPayload) => {
    try {
      const response = await authApi.changePassword(data);
      success('Password Updated', response.message || 'Password changed successfully.');
    } catch (err: any) {
      error('Password Change Failed', err.message || 'Could not change password');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
