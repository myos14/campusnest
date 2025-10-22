"""
Modelos de SQLAlchemy para Rentas y Reportes
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Renta(Base):
    """Modelo de Renta - Historial de rentas"""
    __tablename__ = "rentas"

    id_renta = Column(Integer, primary_key=True, autoincrement=True)
    id_estudiante = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_propiedad = Column(UUID(as_uuid=True), ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    id_arrendador = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    precio_acordado = Column(DECIMAL(10, 2), nullable=False)
    estado_renta = Column(String(50), default="activa")  # activa, finalizada, cancelada
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    estudiante = relationship("Usuario", foreign_keys=[id_estudiante])
    propiedad = relationship("Propiedad")
    arrendador = relationship("Usuario", foreign_keys=[id_arrendador])
    pagos = relationship("Pago", back_populates="renta", cascade="all, delete-orphan")


class ReporteInquilino(Base):
    """Modelo de Reportes de Inquilinos Problemáticos"""
    __tablename__ = "reportes_inquilino"

    id_reporte = Column(Integer, primary_key=True, autoincrement=True)
    id_arrendador = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_estudiante_reportado = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_renta = Column(Integer, ForeignKey("rentas.id_renta", ondelete="SET NULL"), nullable=True)
    tipo_problema = Column(String(50), nullable=False)  # impago, daños_propiedad, problemas_convivencia, actividades_ilegales, otro
    descripcion_detallada = Column(Text, nullable=False)
    evidencias_urls = Column(JSONB, nullable=True)  # Array de URLs de fotos/documentos
    gravedad = Column(String(20), default="moderado")  # leve, moderado, grave
    fecha_incidente = Column(Date, nullable=True)
    fecha_reporte = Column(DateTime(timezone=True), server_default=func.now())
    estado_reporte = Column(String(20), default="pendiente")  # pendiente, revisado, verificado, rechazado
    verificado_por_admin = Column(Boolean, default=False)
    visible_otros_arrendadores = Column(Boolean, default=False)

    # Relaciones
    arrendador = relationship("Usuario", foreign_keys=[id_arrendador])
    estudiante_reportado = relationship("Usuario", foreign_keys=[id_estudiante_reportado])
    renta = relationship("Renta")