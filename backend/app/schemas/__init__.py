"""
Schemas Pydantic para la aplicación
"""

from app.schemas.usuario import (
    UsuarioBase, UsuarioCreate, UsuarioResponse, UsuarioUpdate,
    PerfilEstudianteBase, PerfilEstudianteCreate, PerfilEstudianteResponse,
    PerfilArrendadorBase, PerfilArrendadorCreate, PerfilArrendadorResponse,
    UsuarioLogin, Token, TokenData
)

from app.schemas.propiedad import (
    PropiedadCreate, PropiedadUpdate, PropiedadResponse, PropiedadDetalleResponse,
    CaracteristicaPropiedadCreate, CaracteristicaPropiedadResponse,
    FotoPropiedadCreate, FotoPropiedadResponse
)

__all__ = [
    "UsuarioBase", "UsuarioCreate", "UsuarioResponse", "UsuarioUpdate",
    "PerfilEstudianteBase", "PerfilEstudianteCreate", "PerfilEstudianteResponse",
    "PerfilArrendadorBase", "PerfilArrendadorCreate", "PerfilArrendadorResponse",
    "UsuarioLogin", "Token", "TokenData",
    "PropiedadCreate", "PropiedadUpdate", "PropiedadResponse", "PropiedadDetalleResponse",
    "CaracteristicaPropiedadCreate", "CaracteristicaPropiedadResponse",
    "FotoPropiedadCreate", "FotoPropiedadResponse"
]