"""
Router para gestión de usuarios
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse, UsuarioUpdate
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UsuarioResponse)
async def obtener_perfil(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener perfil del usuario actual"""
    return current_user


@router.put("/me", response_model=UsuarioResponse)
async def actualizar_perfil(
    usuario_data: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar perfil del usuario actual"""
    if usuario_data.nombre_completo:
        current_user.nombre_completo = usuario_data.nombre_completo
    
    if usuario_data.telefono is not None:
        current_user.telefono = usuario_data.telefono
    
    if usuario_data.foto_perfil_url:
        current_user.foto_perfil_url = usuario_data.foto_perfil_url
    
    db.commit()
    db.refresh(current_user)
    
    return current_user