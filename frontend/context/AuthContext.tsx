import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import type { Usuario, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const storedToken = await authService.getToken();
      const storedUser = await authService.getStoredUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      await logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.access_token);
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);
    setUser(response.user);
    setToken(response.access_token);
  }

  async function logout() {
    try {
      setUser(null);
      setToken(null);
      await authService.logout();
    } catch (error) {
      setUser(null);
      setToken(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}