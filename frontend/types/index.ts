/**
 * Tipos TypeScript para CampusNest
 */

// Usuario
export interface Usuario {
  id_usuario: string;
  email: string;
  nombre_completo: string;
  tipo_usuario: 'estudiante' | 'arrendador' | 'ambos';
  telefono?: string;
  foto_perfil_url?: string;
  verificado: boolean;
  activo: boolean;
  fecha_registro: string;
  perfil_estudiante?: PerfilEstudiante;
  perfil_arrendador?: PerfilArrendador;
}

export interface PerfilEstudiante {
  id_perfil_estudiante: number;
  universidad?: string;
  carrera?: string;
  semestre?: number;
  email_institucional?: string;
  verificado_estudiante: boolean;
}

export interface PerfilArrendador {
  id_perfil_arrendador: number;
  rfc?: string;
  verificado_arrendador: boolean;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre_completo: string;
  tipo_usuario: 'estudiante' | 'arrendador' | 'ambos';
  telefono?: string;
  perfil_estudiante?: {
    universidad?: string;
    carrera?: string;
    semestre?: number;
  };
  perfil_arrendador?: {
    rfc?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: Usuario;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userData: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getToken(): Promise<string | null>;
  getCurrentUser(): Promise<Usuario>;
  updateUser(user: Usuario): Promise<void>; // 👈 NUEVO
  getStoredUser(): Promise<Usuario | null>; // 👈 NUEVO
}

// Propiedad
export interface Propiedad {
  id_propiedad: string;
  id_arrendador: string;
  titulo: string;
  descripcion?: string;
  tipo_propiedad: 'cuarto_individual' | 'cuarto_compartido' | 'departamento' | 'casa';
  precio_mensual: number;
  deposito_requerido?: number;
  direccion_completa: string;
  latitud?: number;
  longitud?: number;
  colonia?: string;
  codigo_postal?: string;
  ciudad: string;
  estado: string;
  disponible: boolean;
  fecha_disponibilidad?: string;
  activa: boolean;
  fecha_publicacion: string;
  fecha_actualizacion: string;
  caracteristicas?: CaracteristicaPropiedad;
  fotos?: FotoPropiedad[];
}

export interface CaracteristicaPropiedad {
  id_caracteristica: number;
  wifi: boolean;
  agua_incluida: boolean;
  luz_incluida: boolean;
  gas_incluido: boolean;
  amueblado: boolean;
  cocina: boolean;
  lavadora: boolean;
  estacionamiento: boolean;
  mascotas_permitidas: boolean;
  banio_privado: boolean;
  numero_camas: number;
  numero_banios: number;
  metros_cuadrados?: number;
}

export interface FotoPropiedad {
  id_foto: number;
  url_foto: string;
  orden: number;
  es_principal: boolean;
  fecha_subida: string;
}

export interface PropiedadFiltros {
  tipo_propiedad?: string;
  precio_min?: number;
  precio_max?: number;
  ciudad?: string;
  colonia?: string;
  wifi?: boolean;
  amueblado?: boolean;
  mascotas_permitidas?: boolean;
  disponible?: boolean;
  limit?: number;
  offset?: number;
}

// Calificaciones
export interface CalificacionPropiedad {
  id_calificacion: number;
  calificacion_general: number;
  calificacion_limpieza: number;
  calificacion_ubicacion: number;
  calificacion_precio: number;
  calificacion_comunicacion: number;
  comentario?: string;
  fecha_calificacion: string;
  estudiante_nombre?: string;
}

export interface EstadisticasPropiedad {
  id_propiedad: string;
  total_calificaciones: number;
  promedio_general: number;
  promedio_limpieza: number;
  promedio_ubicacion: number;
  promedio_precio: number;
  promedio_comunicacion: number;
}

// Reportes
export interface ReporteInquilino {
  id_reporte: number;
  id_estudiante_reportado: string;
  tipo_problema: 'impago' | 'daños_propiedad' | 'problemas_convivencia' | 'actividades_ilegales' | 'otro';
  descripcion_detallada: string;
  gravedad: 'leve' | 'moderado' | 'grave';
  fecha_incidente?: string;
  fecha_reporte: string;
  estado_reporte: string;
  verificado_por_admin: boolean;
  visible_otros_arrendadores: boolean;
  estudiante_nombre?: string;
  estudiante_email?: string;
  arrendador_nombre?: string;
}

// API Response
export interface ApiError {
  detail: string | Array<{ msg: string; type: string }>;
}