import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import type { Usuario, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const isAuth = await authService.isAuthenticated();
    setLoading(false);
    // Aquí podrías hacer una llamada a /me para obtener el usuario
  }

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    setUser(response.user);
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);
    setUser(response.user);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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