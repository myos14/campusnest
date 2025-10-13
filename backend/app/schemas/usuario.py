"""
Schemas Pydantic para Usuarios - COMPATIBLE con BD PostgreSQL
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

# ============================================
# PERFIL ESTUDIANTE
# ============================================

class PerfilEstudianteBase(BaseModel):
    """Base para perfil de estudiante"""
    universidad: Optional[str] = None
    carrera: Optional[str] = None
    semestre: Optional[int] = None
    email_institucional: Optional[EmailStr] = None


class PerfilEstudianteCreate(PerfilEstudianteBase):
    """Schema para crear perfil de estudiante"""
    pass


class PerfilEstudianteResponse(PerfilEstudianteBase):
    """Schema para respuesta de perfil de estudiante"""
    id_perfil_estudiante: int  # CORREGIDO: Integer
    verificado_estudiante: bool
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# PERFIL ARRENDADOR
# ============================================

class PerfilArrendadorBase(BaseModel):
    """Base para perfil de arrendador"""
    rfc: Optional[str] = Field(None, max_length=13)


class PerfilArrendadorCreate(PerfilArrendadorBase):
    """Schema para crear perfil de arrendador"""
    pass


class PerfilArrendadorResponse(PerfilArrendadorBase):
    """Schema para respuesta de perfil de arrendador"""
    id_perfil_arrendador: int  # CORREGIDO: Integer
    verificado_arrendador: bool
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# USUARIO
# ============================================

class UsuarioBase(BaseModel):
    """Base para usuario"""
    email: EmailStr
    nombre_completo: str = Field(..., min_length=3, max_length=255)
    tipo_usuario: str = Field(..., pattern="^(estudiante|arrendador|ambos)$")
    telefono: Optional[str] = Field(None, max_length=20)


class UsuarioCreate(UsuarioBase):
    """Schema para crear usuario (registro)"""
    password: str = Field(..., min_length=8, max_length=100)
    perfil_estudiante: Optional[PerfilEstudianteCreate] = None
    perfil_arrendador: Optional[PerfilArrendadorCreate] = None


class UsuarioUpdate(BaseModel):
    """Schema para actualizar usuario"""
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=255)
    telefono: Optional[str] = Field(None, max_length=20)
    foto_perfil_url: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    """Schema para respuesta de usuario (NO incluye password)"""
    id_usuario: uuid.UUID
    verificado: bool
    activo: bool
    fecha_registro: datetime
    ultima_conexion: Optional[datetime] = None
    foto_perfil_url: Optional[str] = None
    perfil_estudiante: Optional[PerfilEstudianteResponse] = None
    perfil_arrendador: Optional[PerfilArrendadorResponse] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# AUTH
# ============================================

class UsuarioLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema para respuesta de token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UsuarioResponse


class TokenData(BaseModel):
    """Schema para datos dentro del token"""
    user_id: Optional[str] = None