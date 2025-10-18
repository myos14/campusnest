/**
 * Cliente API para CampusNest
 */

import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type {
  Usuario,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthService,
  Propiedad,
  PropiedadFiltros,
  CalificacionPropiedad,
  EstadisticasPropiedad,
  ReporteInquilino,
  ApiError
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Cliente Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Manejo de errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      await removeToken();
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

// Utilidades de token
async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    await SecureStore.setItemAsync('token', token);
  }
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  } else {
    return await SecureStore.getItemAsync('token');
  }
}

async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // 👈 También borrar user
    } else {
      await SecureStore.deleteItemAsync('token');
      // Intentar borrar user (puede que no exista)
      try {
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
        // Ignorar si no existe
      }
    }
    console.log('✅ Token y user eliminados del storage');
  } catch (error) {
    console.error('❌ Error eliminando token:', error);
    throw error;
  }
}
// ============================================
// AUTH
// ============================================

export const authService: AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      await saveToken(data.access_token);
      
      // Guardar usuario
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      }
      
      console.log('✅ Login exitoso');
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      await saveToken(data.access_token);
      
      // Guardar usuario
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      }
      
      console.log('✅ Registro exitoso');
      return data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    console.log('🔴 Limpiando authService (logout)...');
    try {
      // Eliminar token y usuario del storage
      await removeToken();
      
      // Limpiar header de axios
      delete api.defaults.headers.common['Authorization'];
      
      console.log('✅ Logout completado en authService');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
  },

  async getToken(): Promise<string | null> {
    return await getToken();
  },

  // 👇 CAMBIO: Ya no llamar al backend, solo leer del storage
  async getCurrentUser(): Promise<Usuario> {
    try {
      // Intentar obtener del storage primero
      const cachedUser = await this.getStoredUser();
      if (cachedUser) {
        console.log('✅ Usuario obtenido del storage');
        return cachedUser;
      }
      
      // Si no está en storage, error (porque no hay endpoint /usuarios/me)
      throw new Error('No hay usuario en storage y no existe endpoint /usuarios/me');
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      throw error;
    }
  },

  async updateUser(user: Usuario): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
      }
      console.log('✅ Usuario actualizado en storage');
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
    }
  },

  async getStoredUser(): Promise<Usuario | null> {
    try {
      let userStr: string | null = null;
      if (Platform.OS === 'web') {
        userStr = localStorage.getItem('user');
      } else {
        userStr = await SecureStore.getItemAsync('user');
      }
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario del storage:', error);
      return null;
    }
  },
};

// ============================================
// PROPIEDADES
// ============================================

export const propiedadesService = {
  async obtenerPropiedades(filtros?: PropiedadFiltros): Promise<Propiedad[]> {
    const { data } = await api.get<Propiedad[]>('/propiedades', { params: filtros });
    return data;
  },

  async obtenerPropiedad(id: string): Promise<Propiedad> {
    const { data } = await api.get<Propiedad>(`/propiedades/${id}`);
    return data;
  },

  async crearPropiedad(propiedad: Partial<Propiedad>): Promise<Propiedad> {
    const { data } = await api.post<Propiedad>('/propiedades', propiedad);
    return data;
  },

  async actualizarPropiedad(id: string, propiedad: Partial<Propiedad>): Promise<Propiedad> {
    const { data } = await api.put<Propiedad>(`/propiedades/${id}`, propiedad);
    return data;
  },

  async eliminarPropiedad(id: string): Promise<void> {
    await api.delete(`/propiedades/${id}`);
  },

  async misPropiedades(): Promise<Propiedad[]> {
    const { data } = await api.get<Propiedad[]>('/propiedades/mis-propiedades');
    return data;
  },
};

// ============================================
// FAVORITOS
// ============================================

export const favoritosService = {
  async obtenerFavoritos(): Promise<Propiedad[]> {
    const { data } = await api.get<Propiedad[]>('/favoritos');
    return data;
  },

  async agregarFavorito(idPropiedad: string): Promise<void> {
    await api.post(`/favoritos/${idPropiedad}`);
  },

  async eliminarFavorito(idPropiedad: string): Promise<void> {
    await api.delete(`/favoritos/${idPropiedad}`);
  },

  async esFavorito(idPropiedad: string): Promise<boolean> {
    const { data } = await api.get<{ es_favorito: boolean }>(`/favoritos/check/${idPropiedad}`);
    return data.es_favorito;
  },
};

// ============================================
// CALIFICACIONES
// ============================================

export const calificacionesService = {
  async obtenerCalificacionesPropiedad(idPropiedad: string): Promise<CalificacionPropiedad[]> {
    const { data } = await api.get<CalificacionPropiedad[]>(`/calificaciones/propiedad/${idPropiedad}`);
    return data;
  },

  async obtenerEstadisticasPropiedad(idPropiedad: string): Promise<EstadisticasPropiedad> {
    const { data } = await api.get<EstadisticasPropiedad>(`/calificaciones/propiedad/${idPropiedad}/estadisticas`);
    return data;
  },

  async calificarPropiedad(calificacion: any): Promise<CalificacionPropiedad> {
    const { data } = await api.post<CalificacionPropiedad>('/calificaciones/propiedad', calificacion);
    return data;
  },
};

// ============================================
// REPORTES
// ============================================

export const reportesService = {
  async obtenerReportesEstudiante(idEstudiante: string): Promise<ReporteInquilino[]> {
    const { data } = await api.get<ReporteInquilino[]>(`/reportes/estudiante/${idEstudiante}`);
    return data;
  },

  async crearReporte(reporte: Partial<ReporteInquilino>): Promise<ReporteInquilino> {
    const { data } = await api.post<ReporteInquilino>('/reportes', reporte);
    return data;
  },

  async misReportes(): Promise<ReporteInquilino[]> {
    const { data } = await api.get<ReporteInquilino[]>('/reportes/mis-reportes');
    return data;
  },
};

// Exportar cliente para usos personalizados
export default api;