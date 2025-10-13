"""
Schemas Pydantic para Propiedades - Validación y serialización
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
import uuid


# ============================================
# CARACTERÍSTICAS DE PROPIEDAD
# ============================================

class CaracteristicaPropiedadBase(BaseModel):
    """Base para características de propiedad"""
    wifi: bool = False
    agua_incluida: bool = False
    luz_incluida: bool = False
    gas_incluido: bool = False
    amueblado: bool = False
    cocina: bool = False
    lavadora: bool = False
    estacionamiento: bool = False
    mascotas_permitidas: bool = False
    banio_privado: bool = False
    numero_camas: int = Field(default=1, ge=1)
    numero_banios: int = Field(default=1, ge=1)
    metros_cuadrados: Optional[Decimal] = Field(None, ge=0)


class CaracteristicaPropiedadCreate(CaracteristicaPropiedadBase):
    """Schema para crear características"""
    pass


class CaracteristicaPropiedadResponse(CaracteristicaPropiedadBase):
    """Schema para respuesta de características"""
    id_caracteristica: int
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# FOTOS DE PROPIEDAD
# ============================================

class FotoPropiedadBase(BaseModel):
    """Base para fotos de propiedad"""
    url_foto: str
    orden: int = 0
    es_principal: bool = False


class FotoPropiedadCreate(FotoPropiedadBase):
    """Schema para crear foto"""
    pass


class FotoPropiedadResponse(FotoPropiedadBase):
    """Schema para respuesta de foto"""
    id_foto: int
    fecha_subida: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# PROPIEDAD
# ============================================

class PropiedadBase(BaseModel):
    """Base para propiedad"""
    titulo: str = Field(..., min_length=10, max_length=255)
    descripcion: Optional[str] = None
    tipo_propiedad: str = Field(..., pattern="^(cuarto_individual|cuarto_compartido|departamento|casa)$")
    precio_mensual: Decimal = Field(..., gt=0)
    deposito_requerido: Optional[Decimal] = Field(None, ge=0)
    direccion_completa: str = Field(..., min_length=10)
    latitud: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitud: Optional[Decimal] = Field(None, ge=-180, le=180)
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = Field(None, max_length=10)
    ciudad: str = "Puebla"
    estado: str = "Puebla"
    disponible: bool = True
    fecha_disponibilidad: Optional[date] = None


class PropiedadCreate(PropiedadBase):
    """Schema para crear propiedad"""
    caracteristicas: Optional[CaracteristicaPropiedadCreate] = None
    fotos: Optional[List[FotoPropiedadCreate]] = None


class PropiedadUpdate(BaseModel):
    """Schema para actualizar propiedad"""
    titulo: Optional[str] = Field(None, min_length=10, max_length=255)
    descripcion: Optional[str] = None
    precio_mensual: Optional[Decimal] = Field(None, gt=0)
    deposito_requerido: Optional[Decimal] = Field(None, ge=0)
    disponible: Optional[bool] = None
    fecha_disponibilidad: Optional[date] = None
    caracteristicas: Optional[CaracteristicaPropiedadCreate] = None


class PropiedadResponse(PropiedadBase):
    """Schema para respuesta de propiedad"""
    id_propiedad: uuid.UUID
    id_arrendador: uuid.UUID
    activa: bool
    fecha_publicacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PropiedadDetalleResponse(PropiedadResponse):
    """Schema para respuesta detallada con características y fotos"""
    caracteristicas: Optional[CaracteristicaPropiedadResponse] = None
    fotos: List[FotoPropiedadResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# FILTROS DE BÚSQUEDA
# ============================================

class PropiedadFiltros(BaseModel):
    """Schema para filtros de búsqueda de propiedades"""
    tipo_propiedad: Optional[str] = None
    precio_min: Optional[Decimal] = Field(None, ge=0)
    precio_max: Optional[Decimal] = Field(None, ge=0)
    ciudad: Optional[str] = "Puebla"
    colonia: Optional[str] = None
    wifi: Optional[bool] = None
    amueblado: Optional[bool] = None
    mascotas_permitidas: Optional[bool] = None
    disponible: bool = True
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)