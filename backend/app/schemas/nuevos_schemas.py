"""
Schemas Pydantic para Mensajes, Notificaciones y Pagos
CREAR EN: app/schemas/mensajes.py, notificaciones.py, pagos.py
O agregar a archivos existentes según tu estructura
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================================================================
# SCHEMAS: MENSAJES
# ============================================================================

class MensajeCreate(BaseModel):
    """Schema para crear un mensaje"""
    id_destinatario: str  # UUID como string
    contenido: str
    id_propiedad: Optional[int] = None


class MensajeResponse(BaseModel):
    """Schema de respuesta de mensaje"""
    id_mensaje: int
    id_remitente: str
    id_destinatario: str
    contenido: str
    leido: bool
    fecha_envio: datetime
    id_propiedad: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)


class ConversacionResponse(BaseModel):
    """Schema para lista de conversaciones"""
    id_usuario: str
    nombre_usuario: str
    foto_usuario: Optional[str] = None
    ultimo_mensaje: str
    fecha_ultimo_mensaje: datetime
    mensajes_no_leidos: int


# ============================================================================
# SCHEMAS: NOTIFICACIONES
# ============================================================================

class TipoNotificacionEnum(str, Enum):
    """Tipos de notificaciones"""
    NUEVA_SOLICITUD_RENTA = "nueva_solicitud_renta"
    RENTA_APROBADA = "renta_aprobada"
    RENTA_RECHAZADA = "renta_rechazada"
    NUEVO_MENSAJE = "nuevo_mensaje"
    NUEVA_CALIFICACION = "nueva_calificacion"
    PAGO_PENDIENTE = "pago_pendiente"
    PAGO_RECIBIDO = "pago_recibido"
    PROPIEDAD_FAVORITA_ACTUALIZADA = "propiedad_favorita_actualizada"
    RECORDATORIO_VISITA = "recordatorio_visita"
    NUEVO_REPORTE = "nuevo_reporte"


class NotificacionCreate(BaseModel):
    """Schema para crear notificación"""
    tipo: TipoNotificacionEnum
    titulo: str
    mensaje: str
    id_relacionado: Optional[int] = None
    url_accion: Optional[str] = None


class NotificacionResponse(BaseModel):
    """Schema de respuesta de notificación"""
    id_notificacion: int
    tipo: str
    titulo: str
    mensaje: str
    leido: bool
    fecha_creacion: datetime
    id_relacionado: Optional[int] = None
    url_accion: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class ConfiguracionNotificaciones(BaseModel):
    """Schema para configuración de notificaciones"""
    email_nuevas_solicitudes: bool = True
    email_mensajes: bool = True
    email_calificaciones: bool = True
    email_pagos: bool = True
    push_nuevas_solicitudes: bool = True
    push_mensajes: bool = True
    push_calificaciones: bool = True
    push_pagos: bool = True


# ============================================================================
# SCHEMAS: PAGOS
# ============================================================================

class MetodoPagoEnum(str, Enum):
    """Métodos de pago disponibles"""
    STRIPE = "stripe"
    OPENPAY = "openpay"
    TRANSFERENCIA = "transferencia"
    EFECTIVO = "efectivo"


class EstadoPagoEnum(str, Enum):
    """Estados de pago"""
    PENDIENTE = "pendiente"
    COMPLETADO = "completado"
    FALLIDO = "fallido"
    REEMBOLSADO = "reembolsado"
    CANCELADO = "cancelado"


class PagoCreate(BaseModel):
    """Schema para crear intención de pago"""
    id_renta: int
    monto: float
    metodo_pago: MetodoPagoEnum


class PagoConfirmar(BaseModel):
    """Schema para confirmar pago"""
    payment_intent_id: str
    id_renta: int


class PagoResponse(BaseModel):
    """Schema de respuesta de pago"""
    id_pago: int
    id_renta: int
    monto: float
    metodo_pago: str
    estado: str
    fecha_pago: datetime
    referencia_externa: Optional[str] = None
    comprobante_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)