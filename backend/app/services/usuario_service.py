"""
Servicio para operaciones relacionadas con usuarios
"""

from sqlalchemy.orm import Session
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador
from app.schemas.usuario import UsuarioCreate  # CAMBIADO
from app.utils.security import get_password_hash, verify_password
from fastapi import HTTPException, status


class UsuarioService:
    
    @staticmethod
    def get_usuario_by_email(db: Session, email: str) -> Usuario:
        return db.query(Usuario).filter(Usuario.email == email).first()
    
    @staticmethod
    def crear_usuario(db: Session, usuario_data: UsuarioCreate) -> Usuario:
        # Verificar si el email ya existe
        if UsuarioService.get_usuario_by_email(db, usuario_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear usuario
        hashed_password = get_password_hash(usuario_data.password)
        db_usuario = Usuario(
            email=usuario_data.email,
            password_hash=hashed_password,
            tipo_usuario=usuario_data.tipo_usuario,
            nombre_completo=usuario_data.nombre_completo,
            telefono=usuario_data.telefono
        )
        
        db.add(db_usuario)
        db.flush()
        
        # Crear perfil según tipo
        if usuario_data.tipo_usuario in ["estudiante", "ambos"]:
            if usuario_data.perfil_estudiante:
                perfil = PerfilEstudiante(
                    id_usuario=db_usuario.id_usuario,
                    universidad=usuario_data.perfil_estudiante.universidad,
                    carrera=usuario_data.perfil_estudiante.carrera,
                    semestre=usuario_data.perfil_estudiante.semestre,
                    email_institucional=usuario_data.perfil_estudiante.email_institucional
                )
                db.add(perfil)
        
        if usuario_data.tipo_usuario in ["arrendador", "ambos"]:
            if usuario_data.perfil_arrendador:
                perfil = PerfilArrendador(
                    id_usuario=db_usuario.id_usuario,
                    rfc=usuario_data.perfil_arrendador.rfc
                )
                db.add(perfil)
        
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    
    @staticmethod
    def autenticar_usuario(db: Session, email: str, password: str) -> Usuario:
        usuario = UsuarioService.get_usuario_by_email(db, email)
        if not usuario or not verify_password(password, usuario.password_hash):
            return None
        return usuario


usuario_service = UsuarioService()