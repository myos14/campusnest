"""
Modelos de SQLAlchemy para Propiedades
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Propiedad(Base):
    """Modelo de Propiedad"""
    __tablename__ = "propiedades"

    id_propiedad = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_arrendador = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo_propiedad = Column(String(50), nullable=False)  # CORREGIDO: String en lugar de Enum
    precio_mensual = Column(DECIMAL(10, 2), nullable=False)
    deposito_requerido = Column(DECIMAL(10, 2), nullable=True)
    direccion_completa = Column(Text, nullable=False)
    latitud = Column(DECIMAL(10, 8), nullable=True)
    longitud = Column(DECIMAL(11, 8), nullable=True)
    colonia = Column(String(255), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    ciudad = Column(String(100), default="Puebla")
    estado = Column(String(100), default="Puebla")
    disponible = Column(Boolean, default=True)
    fecha_disponibilidad = Column(Date, nullable=True)
    activa = Column(Boolean, default=True)
    fecha_publicacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    arrendador = relationship("Usuario", back_populates="propiedades")
    caracteristicas = relationship("CaracteristicaPropiedad", back_populates="propiedad", uselist=False, cascade="all, delete-orphan")
    fotos = relationship("FotoPropiedad", back_populates="propiedad", cascade="all, delete-orphan")
    # mensajes = relationship("Mensaje", back_populates="propiedad")


class CaracteristicaPropiedad(Base):
    """Modelo de Características de Propiedad - COMPATIBLE"""
    __tablename__ = "caracteristicas_propiedad"

    id_caracteristica = Column(Integer, primary_key=True, autoincrement=True)
    id_propiedad = Column(UUID(as_uuid=True), ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), unique=True, nullable=False)
    wifi = Column(Boolean, default=False)
    agua_incluida = Column(Boolean, default=False)
    luz_incluida = Column(Boolean, default=False)
    gas_incluido = Column(Boolean, default=False)
    amueblado = Column(Boolean, default=False)
    cocina = Column(Boolean, default=False)
    lavadora = Column(Boolean, default=False)
    estacionamiento = Column(Boolean, default=False)
    mascotas_permitidas = Column(Boolean, default=False)
    banio_privado = Column(Boolean, default=False)
    numero_camas = Column(Integer, default=1)
    numero_banios = Column(Integer, default=1)
    metros_cuadrados = Column(DECIMAL(6, 2), nullable=True)

    # Relación
    propiedad = relationship("Propiedad", back_populates="caracteristicas")


class FotoPropiedad(Base):
    """Modelo de Fotos de Propiedad - COMPATIBLE"""
    __tablename__ = "fotos_propiedad"

    id_foto = Column(Integer, primary_key=True, autoincrement=True)
    id_propiedad = Column(UUID(as_uuid=True), ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    url_foto = Column(Text, nullable=False)
    orden = Column(Integer, default=0)
    es_principal = Column(Boolean, default=False)
    fecha_subida = Column(DateTime(timezone=True), server_default=func.now())

    # Relación
    propiedad = relationship("Propiedad", back_populates="fotos")