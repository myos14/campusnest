"""
Schemas Pydantic para Rentas y Reportes
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
import uuid


# ============================================
# RENTAS
# ============================================

class RentaBase(BaseModel):
    """Base para renta"""
    id_propiedad: uuid.UUID
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    precio_acordado: Decimal = Field(..., gt=0)


class RentaCreate(RentaBase):
    """Schema para crear renta"""
    id_estudiante: uuid.UUID


class RentaUpdate(BaseModel):
    """Schema para actualizar renta"""
    fecha_fin: Optional[date] = None
    estado_renta: Optional[str] = Field(None, pattern="^(activa|finalizada|cancelada)$")


class RentaResponse(RentaBase):
    """Schema para respuesta de renta"""
    id_renta: int
    id_estudiante: uuid.UUID
    id_arrendador: uuid.UUID
    estado_renta: str
    fecha_creacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# REPORTES DE INQUILINOS
# ============================================

class ReporteInquilinoBase(BaseModel):
    """Base para reporte de inquilino"""
    id_estudiante_reportado: uuid.UUID
    tipo_problema: str = Field(..., pattern="^(impago|daños_propiedad|problemas_convivencia|actividades_ilegales|otro)$")
    descripcion_detallada: str = Field(..., min_length=50, max_length=2000)
    gravedad: str = Field(default="moderado", pattern="^(leve|moderado|grave)$")
    fecha_incidente: Optional[date] = None


class ReporteInquilinoCreate(ReporteInquilinoBase):
    """Schema para crear reporte"""
    id_renta: Optional[int] = None
    evidencias_urls: Optional[List[str]] = None


class ReporteInquilinoUpdate(BaseModel):
    """Schema para actualizar reporte (moderación)"""
    estado_reporte: Optional[str] = Field(None, pattern="^(pendiente|revisado|verificado|rechazado)$")
    verificado_por_admin: Optional[bool] = None
    visible_otros_arrendadores: Optional[bool] = None


class ReporteInquilinoResponse(ReporteInquilinoBase):
    """Schema para respuesta de reporte"""
    id_reporte: int
    id_arrendador: uuid.UUID
    id_renta: Optional[int] = None
    evidencias_urls: Optional[List[str]] = None
    fecha_reporte: datetime
    estado_reporte: str
    verificado_por_admin: bool
    visible_otros_arrendadores: bool
    
    model_config = ConfigDict(from_attributes=True)


class ReporteInquilinoDetalle(ReporteInquilinoResponse):
    """Schema detallado con información del estudiante reportado"""
    estudiante_nombre: Optional[str] = None
    estudiante_email: Optional[str] = None
    arrendador_nombre: Optional[str] = None