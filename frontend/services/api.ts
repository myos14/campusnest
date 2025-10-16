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
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
  } else {
    await SecureStore.deleteItemAsync('token');
  }
}

// ============================================
// AUTH
// ============================================

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    await saveToken(data.access_token);
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    await saveToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    await removeToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
  },

  async getToken(): Promise<string | null> {
    return await getToken();
  },

  async getCurrentUser(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/usuarios/me');
    return data;
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