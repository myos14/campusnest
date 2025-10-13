"""
Router para autenticación: registro y login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioLogin, Token
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar un nuevo usuario
    
    - **email**: Email único del usuario
    - **password**: Contraseña (mínimo 8 caracteres)
    - **tipo_usuario**: estudiante, arrendador o ambos
    - **nombre_completo**: Nombre completo del usuario
    """
    
    # Verificar si el email ya existe
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    db_user = Usuario(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        tipo_usuario=user_data.tipo_usuario,
        nombre_completo=user_data.nombre_completo,
        telefono=user_data.telefono,
    )
    
    db.add(db_user)
    db.flush()  # Para obtener el id_usuario antes de commit
    
    # Crear perfil según tipo de usuario (USANDO STRINGS)
    if user_data.tipo_usuario in ["estudiante", "ambos"]:
        if user_data.perfil_estudiante:
            perfil_est = PerfilEstudiante(
                id_usuario=db_user.id_usuario,
                universidad=user_data.perfil_estudiante.universidad,
                carrera=user_data.perfil_estudiante.carrera,
                semestre=user_data.perfil_estudiante.semestre,
                email_institucional=user_data.perfil_estudiante.email_institucional,
            )
            db.add(perfil_est)
    
    if user_data.tipo_usuario in ["arrendador", "ambos"]:
        if user_data.perfil_arrendador:
            perfil_arr = PerfilArrendador(
                id_usuario=db_user.id_usuario,
                rfc=user_data.perfil_arrendador.rfc,
            )
            db.add(perfil_arr)
    
    db.commit()
    db.refresh(db_user)
    
    # Generar token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id_usuario)},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        user=UsuarioResponse.model_validate(db_user)
    )


@router.post("/login", response_model=Token)
def login(
    credentials: UsuarioLogin,
    db: Session = Depends(get_db)
):
    """
    Iniciar sesión
    
    - **email**: Email del usuario
    - **password**: Contraseña
    
    Retorna un JWT token para autenticación
    """
    
    # Buscar usuario por email
    user = db.query(Usuario).filter(Usuario.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Generar token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id_usuario)},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        user=UsuarioResponse.model_validate(user)
    )