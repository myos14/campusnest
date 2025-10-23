"""
Router para autenticación: registro, login y gestión de perfil
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador
from app.schemas.usuario import (
    UsuarioCreate, 
    UsuarioResponse, 
    UsuarioLogin, 
    Token, 
    UsuarioUpdate, 
    PerfilEstudianteCreate,
    PerfilEstudianteUpdate
)
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings
from app.utils.dependencies import get_current_user

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
    
    # DEBUG: Imprimir datos recibidos
    print("=" * 60)
    print("📝 REGISTER - Datos recibidos:")
    print(f"Email: {user_data.email}")
    print(f"Nombre: {user_data.nombre_completo}")
    print(f"Tipo: {user_data.tipo_usuario}")
    print(f"Teléfono: {user_data.telefono}")
    print(f"Foto URL: {user_data.foto_perfil_url}")
    print(f"Perfil Estudiante: {user_data.perfil_estudiante}")
    print(f"Perfil Arrendador: {user_data.perfil_arrendador}")
    print("=" * 60)
    
    try:
        # Verificar si el email ya existe
        existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
        if existing_user:
            print(f"❌ ERROR: Email {user_data.email} ya existe")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear usuario (AGREGADO foto_perfil_url)
        db_user = Usuario(
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            tipo_usuario=user_data.tipo_usuario,
            nombre_completo=user_data.nombre_completo,
            telefono=user_data.telefono,
            foto_perfil_url=user_data.foto_perfil_url,  # ✅ AGREGADO
        )
        
        db.add(db_user)
        db.flush()  # Para obtener el id_usuario antes de commit
        
        print(f"✅ Usuario creado con ID: {db_user.id_usuario}")
        
        # Crear perfil según tipo de usuario
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
                print(f"✅ Perfil estudiante creado")
        
        if user_data.tipo_usuario in ["arrendador", "ambos"]:
            if user_data.perfil_arrendador:
                perfil_arr = PerfilArrendador(
                    id_usuario=db_user.id_usuario,
                    rfc=user_data.perfil_arrendador.rfc,
                )
                db.add(perfil_arr)
                print(f"✅ Perfil arrendador creado")
        
        db.commit()
        db.refresh(db_user)
        
        print(f"✅ Usuario registrado exitosamente: {db_user.email}")
        print(f"   Foto URL guardada: {db_user.foto_perfil_url}")
        print("=" * 60)
        
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
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR EN REGISTER: {type(e).__name__}: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear usuario: {str(e)}"
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


@router.get("/me", response_model=UsuarioResponse)
async def get_perfil_usuario(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener perfil del usuario actual
    """
    return current_user


@router.put("/me", response_model=UsuarioResponse)
async def actualizar_perfil_usuario(
    usuario_data: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar perfil del usuario actual
    """
    try:
        # Actualizar datos básicos del usuario
        if usuario_data.nombre_completo:
            current_user.nombre_completo = usuario_data.nombre_completo
        
        if usuario_data.telefono is not None:
            current_user.telefono = usuario_data.telefono
        
        if usuario_data.foto_perfil_url:
            current_user.foto_perfil_url = usuario_data.foto_perfil_url
        
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar usuario: {str(e)}"
        )


@router.put("/me/perfil-estudiante", response_model=UsuarioResponse)
async def actualizar_perfil_estudiante(
    perfil_data: PerfilEstudianteUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar perfil de estudiante del usuario actual
    """
    try:
        # Verificar que el usuario tenga tipo estudiante o ambos
        if current_user.tipo_usuario not in ["estudiante", "ambos"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario no tiene perfil de estudiante"
            )
        
        # Verificar si ya tiene perfil
        if not current_user.perfil_estudiante:
            # Crear perfil nuevo
            perfil = PerfilEstudiante(
                id_usuario=current_user.id_usuario,
                **perfil_data.model_dump(exclude_unset=True)
            )
            db.add(perfil)
        else:
            # Actualizar perfil existente
            for key, value in perfil_data.model_dump(exclude_unset=True).items():
                setattr(current_user.perfil_estudiante, key, value)
        
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar perfil estudiante: {str(e)}"
        )