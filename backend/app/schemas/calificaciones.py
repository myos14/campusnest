"""
Schemas Pydantic para Calificaciones Bidireccionales
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
import uuid


# ============================================
# CALIFICACIONES DE PROPIEDADES (Estudiantes → Propiedades)
# ============================================

class CalificacionPropiedadBase(BaseModel):
    """Base para calificación de propiedad"""
    calificacion_general: int = Field(..., ge=1, le=5)
    calificacion_limpieza: int = Field(..., ge=1, le=5)
    calificacion_ubicacion: int = Field(..., ge=1, le=5)
    calificacion_precio: int = Field(..., ge=1, le=5)
    calificacion_comunicacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=1000)


class CalificacionPropiedadCreate(CalificacionPropiedadBase):
    """Schema para crear calificación de propiedad"""
    id_renta: int


class CalificacionPropiedadResponse(CalificacionPropiedadBase):
    """Schema para respuesta de calificación de propiedad"""
    id_calificacion: int
    id_renta: int
    id_estudiante: uuid.UUID
    id_propiedad: uuid.UUID
    fecha_calificacion: datetime
    visible: bool
    
    model_config = ConfigDict(from_attributes=True)


class CalificacionPropiedadDetalle(CalificacionPropiedadResponse):
    """Schema detallado con información del estudiante"""
    estudiante_nombre: Optional[str] = None


# ============================================
# CALIFICACIONES DE INQUILINOS (Arrendadores → Estudiantes)
# ============================================

class CalificacionInquilinoBase(BaseModel):
    """Base para calificación de inquilino"""
    calificacion_general: int = Field(..., ge=1, le=5)
    calificacion_pago_puntual: int = Field(..., ge=1, le=5)
    calificacion_cuidado_propiedad: int = Field(..., ge=1, le=5)
    calificacion_convivencia: int = Field(..., ge=1, le=5)
    calificacion_comunicacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=1000)


class CalificacionInquilinoCreate(CalificacionInquilinoBase):
    """Schema para crear calificación de inquilino"""
    id_renta: int


class CalificacionInquilinoResponse(CalificacionInquilinoBase):
    """Schema para respuesta de calificación de inquilino"""
    id_calificacion_inquilino: int
    id_renta: int
    id_arrendador: uuid.UUID
    id_estudiante: uuid.UUID
    fecha_calificacion: datetime
    visible: bool
    
    model_config = ConfigDict(from_attributes=True)


class CalificacionInquilinoDetalle(CalificacionInquilinoResponse):
    """Schema detallado con información del arrendador"""
    arrendador_nombre: Optional[str] = None


# ============================================
# ESTADÍSTICAS DE CALIFICACIONES
# ============================================

class EstadisticasPropiedad(BaseModel):
    """Estadísticas de calificaciones de una propiedad"""
    id_propiedad: uuid.UUID
    total_calificaciones: int
    promedio_general: float
    promedio_limpieza: float
    promedio_ubicacion: float
    promedio_precio: float
    promedio_comunicacion: float


class EstadisticasInquilino(BaseModel):
    """Estadísticas de calificaciones de un inquilino"""
    id_estudiante: uuid.UUID
    total_calificaciones: int
    promedio_general: float
    promedio_pago_puntual: float
    promedio_cuidado_propiedad: float
    promedio_convivencia: float
    promedio_comunicacion: float