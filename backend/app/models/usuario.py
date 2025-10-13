"""
Modelos de SQLAlchemy para Usuarios - COMPATIBLE con BD PostgreSQL EXISTENTE
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Usuario(Base):
    """Modelo de Usuario - COMPATIBLE con BD existente"""
    __tablename__ = "usuarios"

    id_usuario = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    tipo_usuario = Column(String(50), nullable=False)
    nombre_completo = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    foto_perfil_url = Column(Text, nullable=True)
    verificado = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    ultima_conexion = Column(DateTime(timezone=True), nullable=True)

    # Relaciones
    perfil_estudiante = relationship("PerfilEstudiante", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    perfil_arrendador = relationship("PerfilArrendador", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    propiedades = relationship("Propiedad", back_populates="arrendador")


class PerfilEstudiante(Base):
    """Modelo de Perfil de Estudiante - COMPATIBLE con BD existente"""
    __tablename__ = "perfil_estudiante"

    # CORREGIDO: Integer como en tu BD real
    id_perfil_estudiante = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), unique=True, nullable=False)
    universidad = Column(String(255), nullable=True)
    carrera = Column(String(255), nullable=True)
    # CORREGIDO: Integer como en tu BD real
    semestre = Column(Integer, nullable=True)
    email_institucional = Column(String(255), nullable=True)
    verificado_estudiante = Column(Boolean, default=False)

    # Relación
    usuario = relationship("Usuario", back_populates="perfil_estudiante")


class PerfilArrendador(Base):
    """Modelo de Perfil de Arrendador - COMPATIBLE con BD existente"""
    __tablename__ = "perfil_arrendador"

    # CORREGIDO: Integer como en tu BD real
    id_perfil_arrendador = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), unique=True, nullable=False)
    rfc = Column(String(13), nullable=True)
    verificado_arrendador = Column(Boolean, default=False)

    # Relación
    usuario = relationship("Usuario", back_populates="perfil_arrendador")