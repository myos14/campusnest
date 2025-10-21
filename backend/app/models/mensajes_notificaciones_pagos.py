"""
Modelos adicionales: Mensajes, Notificaciones y Pagos
AGREGAR ESTE CONTENIDO A TUS MODELOS EXISTENTES
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
import enum
from app.database import Base


# ============================================================================
# MODELO: MENSAJE (para chat entre usuarios)
# ============================================================================

class Mensaje(Base):
    """Modelo para mensajería entre usuarios"""
    __tablename__ = "mensajes"
    
    id_mensaje = Column(Integer, primary_key=True, autoincrement=True)
    id_remitente = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_destinatario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    contenido = Column(Text, nullable=False)
    leido = Column(Boolean, default=False)
    fecha_envio = Column(DateTime(timezone=True), server_default=func.now())
    id_propiedad = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="SET NULL"), nullable=True)
    
    # Relaciones
    remitente = relationship("Usuario", foreign_keys=[id_remitente], backref="mensajes_enviados")
    destinatario = relationship("Usuario", foreign_keys=[id_destinatario], backref="mensajes_recibidos")
    propiedad = relationship("Propiedad", backref="mensajes")


# ============================================================================
# MODELO: NOTIFICACION (sistema de notificaciones)
# ============================================================================

class TipoNotificacion(enum.Enum):
    """Tipos de notificaciones del sistema"""
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


class Notificacion(Base):
    """Modelo para notificaciones de usuarios"""
    __tablename__ = "notificaciones"
    
    id_notificacion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    tipo = Column(SQLEnum(TipoNotificacion), nullable=False)
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=False)
    leido = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    id_relacionado = Column(Integer, nullable=True)  # ID de renta, mensaje, etc.
    url_accion = Column(String(500), nullable=True)  # URL a donde llevar al usuario
    
    # Relaciones
    usuario = relationship("Usuario", backref="notificaciones")


class ConfiguracionNotificacionesUsuario(Base):
    """Configuración de notificaciones por usuario"""
    __tablename__ = "configuracion_notificaciones"
    
    id_configuracion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Notificaciones por Email
    email_nuevas_solicitudes = Column(Boolean, default=True)
    email_mensajes = Column(Boolean, default=True)
    email_calificaciones = Column(Boolean, default=True)
    email_pagos = Column(Boolean, default=True)
    
    # Notificaciones Push
    push_nuevas_solicitudes = Column(Boolean, default=True)
    push_mensajes = Column(Boolean, default=True)
    push_calificaciones = Column(Boolean, default=True)
    push_pagos = Column(Boolean, default=True)
    
    fecha_actualizacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    usuario = relationship("Usuario", backref="configuracion_notificaciones")


# ============================================================================
# MODELO: PAGO (sistema de pagos)
# ============================================================================

class EstadoPago(enum.Enum):
    """Estados de un pago"""
    PENDIENTE = "pendiente"
    COMPLETADO = "completado"
    FALLIDO = "fallido"
    REEMBOLSADO = "reembolsado"
    CANCELADO = "cancelado"


class MetodoPago(enum.Enum):
    """Métodos de pago disponibles"""
    STRIPE = "stripe"
    OPENPAY = "openpay"
    TRANSFERENCIA = "transferencia"
    EFECTIVO = "efectivo"


class Pago(Base):
    """Modelo para pagos de rentas"""
    __tablename__ = "pagos"
    
    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    id_renta = Column(Integer, ForeignKey("rentas.id_renta", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    metodo_pago = Column(SQLEnum(MetodoPago), nullable=False)
    estado = Column(SQLEnum(EstadoPago), default=EstadoPago.PENDIENTE)
    fecha_pago = Column(DateTime(timezone=True), server_default=func.now())
    referencia_externa = Column(String(255), nullable=True)  # payment_intent_id de Stripe
    comprobante_url = Column(Text, nullable=True)  # URL del comprobante si es transferencia
    notas = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    renta = relationship("Renta", backref="pagos")