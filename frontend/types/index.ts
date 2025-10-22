/**
 * Tipos TypeScript para CampusNest
 * ACTUALIZADO CON NUEVOS MÓDULOS
 */

// ============================================================================
// TIPOS EXISTENTES (no modificar)
// ============================================================================

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
  updateUser(user: Usuario): Promise<void>;
  getStoredUser(): Promise<Usuario | null>;
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

// ============================================================================
// NUEVOS TIPOS - MÓDULOS AGREGADOS
// ============================================================================

// ============================================================================
// UPLOAD DE IMÁGENES
// ============================================================================

export interface ImageUploadResponse {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface MultipleImageUploadResponse {
  total_subidas: number;
  imagenes: ImageUploadResponse[];
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export type TipoNotificacion =
  | 'nueva_solicitud_renta'
  | 'renta_aprobada'
  | 'renta_rechazada'
  | 'nuevo_mensaje'
  | 'nueva_calificacion'
  | 'pago_pendiente'
  | 'pago_recibido'
  | 'propiedad_favorita_actualizada'
  | 'recordatorio_visita'
  | 'nuevo_reporte';

export interface Notificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  id_relacionado?: number;
  url_accion?: string;
}

export interface ConfiguracionNotificaciones {
  email_nuevas_solicitudes: boolean;
  email_mensajes: boolean;
  email_calificaciones: boolean;
  email_pagos: boolean;
  push_nuevas_solicitudes: boolean;
  push_mensajes: boolean;
  push_calificaciones: boolean;
  push_pagos: boolean;
}

// ============================================================================
// MENSAJERÍA
// ============================================================================

export interface Mensaje {
  id_mensaje: number;
  id_remitente: string;
  id_destinatario: string;
  contenido: string;
  leido: boolean;
  fecha_envio: string;
  id_propiedad?: number;
}

export interface MensajeCreate {
  id_destinatario: string;
  contenido: string;
  id_propiedad?: number;
}

export interface Conversacion {
  id_usuario: string;
  nombre_usuario: string;
  foto_usuario?: string;
  ultimo_mensaje: string;
  fecha_ultimo_mensaje: string;
  mensajes_no_leidos: number;
}

export interface WebSocketMessage {
  tipo: 'mensaje' | 'typing' | 'nuevo_mensaje';
  id_remitente?: string;
  remitente_nombre?: string;
  id_destinatario?: string;
  contenido?: string;
  fecha?: string;
  escribiendo?: boolean;
}

// ============================================================================
// PAGOS
// ============================================================================

export type MetodoPago = 'stripe' | 'openpay' | 'transferencia' | 'efectivo';
export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado' | 'cancelado';

export interface Pago {
  id_pago: number;
  id_renta: number;
  monto: number;
  metodo_pago: MetodoPago;
  estado: EstadoPago;
  fecha_pago: string;
  referencia_externa?: string;
  comprobante_url?: string;
}

export interface PagoCreate {
  id_renta: number;
  monto: number;
  metodo_pago: MetodoPago;
}

export interface PagoIntencionResponse {
  id_pago: number;
  client_secret?: string;
  payment_intent_id?: string;
  message?: string;
  cuenta_bancaria?: string;
}

export interface PagoConfirmar {
  payment_intent_id: string;
  id_renta: number;
}