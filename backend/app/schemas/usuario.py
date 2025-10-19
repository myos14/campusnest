# backend/app/schemas/usuario.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# ============= PERFIL ESTUDIANTE =============
class PerfilEstudianteBase(BaseModel):
    universidad: str
    carrera: Optional[str] = None
    semestre: Optional[int] = None
    email_institucional: Optional[EmailStr] = None

class PerfilEstudianteCreate(PerfilEstudianteBase):
    pass

class PerfilEstudianteUpdate(BaseModel):
    universidad: Optional[str] = None
    carrera: Optional[str] = None
    semestre: Optional[int] = None
    email_institucional: Optional[EmailStr] = None

class PerfilEstudianteResponse(PerfilEstudianteBase):
    id_perfil_estudiante: int
    id_usuario: int
    
    class Config:
        from_attributes = True

# ============= PERFIL ARRENDADOR =============
class PerfilArrendadorBase(BaseModel):
    rfc: Optional[str] = None

class PerfilArrendadorCreate(PerfilArrendadorBase):
    pass

class PerfilArrendadorResponse(PerfilArrendadorBase):
    id_perfil_arrendador: int
    id_usuario: int
    
    class Config:
        from_attributes = True

# ============= USUARIO =============
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_completo: str
    telefono: Optional[str] = None
    tipo_usuario: str = Field(..., pattern="^(estudiante|arrendador|ambos)$")

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)
    perfil_estudiante: Optional[PerfilEstudianteCreate] = None
    perfil_arrendador: Optional[PerfilArrendadorCreate] = None

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    foto_perfil_url: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    foto_perfil_url: Optional[str] = None
    activo: bool
    fecha_registro: datetime
    perfil_estudiante: Optional[PerfilEstudianteResponse] = None
    perfil_arrendador: Optional[PerfilArrendadorResponse] = None
    
    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioResponse