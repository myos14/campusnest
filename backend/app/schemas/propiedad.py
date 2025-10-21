from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal

# ============= CARACTERÍSTICAS =============
class CaracteristicaPropiedadBase(BaseModel):
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
    numero_camas: int = Field(default=1, ge=1, le=20)
    numero_banios: int = Field(default=1, ge=1, le=10)
    metros_cuadrados: Optional[Decimal] = None

class CaracteristicaPropiedadCreate(CaracteristicaPropiedadBase):
    pass

class CaracteristicaPropiedadResponse(CaracteristicaPropiedadBase):
    id_caracteristica: int
    id_propiedad: UUID
    
    class Config:
        from_attributes = True

# ============= FOTOS =============
class FotoPropiedadBase(BaseModel):
    url_foto: str
    orden: int = 0
    es_principal: bool = False

class FotoPropiedadCreate(FotoPropiedadBase):
    pass

class FotoPropiedadResponse(FotoPropiedadBase):
    id_foto: int
    id_propiedad: UUID
    fecha_subida: datetime
    
    class Config:
        from_attributes = True

# ============= PROPIEDAD =============
class PropiedadBase(BaseModel):
    titulo: str = Field(..., min_length=10, max_length=255)
    descripcion: Optional[str] = None
    tipo_propiedad: str = Field(..., pattern="^(habitacion|departamento|casa|estudio)$")
    precio_mensual: Decimal = Field(..., gt=0)
    deposito_requerido: Optional[Decimal] = Field(None, ge=0)
    direccion_completa: str = Field(..., min_length=10)
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    ciudad: str = "Puebla"
    estado: str = "Puebla"
    fecha_disponibilidad: Optional[date] = None

class PropiedadCreate(PropiedadBase):
    caracteristicas: CaracteristicaPropiedadCreate
    fotos: List[FotoPropiedadCreate] = []
    
    @validator('fotos')
    def validar_fotos(cls, v):
        if len(v) == 0:
            raise ValueError('Debe incluir al menos una foto')
        if len(v) > 20:
            raise ValueError('Máximo 20 fotos permitidas')
        
        # Verificar que haya exactamente una foto principal
        principales = [f for f in v if f.es_principal]
        if len(principales) == 0:
            # Si no hay principal, marcar la primera como principal
            v[0].es_principal = True
        elif len(principales) > 1:
            raise ValueError('Solo puede haber una foto principal')
        
        return v

class PropiedadUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=10, max_length=255)
    descripcion: Optional[str] = None
    tipo_propiedad: Optional[str] = Field(None, pattern="^(habitacion|departamento|casa|estudio)$")
    precio_mensual: Optional[Decimal] = Field(None, gt=0)
    deposito_requerido: Optional[Decimal] = Field(None, ge=0)
    direccion_completa: Optional[str] = Field(None, min_length=10)
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    disponible: Optional[bool] = None
    fecha_disponibilidad: Optional[date] = None
    caracteristicas: Optional[CaracteristicaPropiedadCreate] = None

class PropiedadResponse(PropiedadBase):
    id_propiedad: UUID
    id_arrendador: UUID
    disponible: bool
    activa: bool
    fecha_publicacion: datetime
    fecha_actualizacion: datetime
    caracteristicas: Optional[CaracteristicaPropiedadResponse] = None
    fotos: List[FotoPropiedadResponse] = []
    
    class Config:
        from_attributes = True

class PropiedadListResponse(BaseModel):
    """Response simplificado para listados (sin toda la info)"""
    id_propiedad: UUID
    titulo: str
    tipo_propiedad: str
    precio_mensual: Decimal
    colonia: Optional[str]
    ciudad: str
    foto_principal: Optional[str] = None  # URL de la foto principal
    numero_camas: Optional[int] = None
    numero_banios: Optional[int] = None
    amueblado: Optional[bool] = None
    disponible: bool
    
    class Config:
        from_attributes = True

class PropiedadDetalleResponse(PropiedadBase):
    """Schema detallado de propiedad con información del arrendador"""
    id_propiedad: int
    id_arrendador: str
    fecha_publicacion: datetime
    
    # Información del arrendador (opcional)
    nombre_arrendador: Optional[str] = None
    telefono_arrendador: Optional[str] = None
    
    class Config:
        from_attributes = True