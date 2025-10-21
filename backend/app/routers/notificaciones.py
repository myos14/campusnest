"""
Router para sistema de notificaciones
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

from app.database import get_db
from app.models.usuario import Usuario
from app.models.mensajes_notificaciones_pagos import (
    Notificacion, 
    ConfiguracionNotificacionesUsuario,
    TipoNotificacion as TipoNotificacionEnum
)
from app.utils.dependencies import get_current_user

router = APIRouter()


# ============================================================================
# SCHEMAS Y ENUMS
# ============================================================================

class TipoNotificacion(str, Enum):
    """Tipos de notificaciones del sistema"""
    NUEVA_SOLICITUD_RENTA = "nueva_solicitud_renta"
    RENTA_APROBADA = "renta_aprobada"
    RENTA_RECHAZADA = "renta_rechazada"
    NUEVO_MENSAJE = "nuevo_mensaje"
    NUEVA_CALIFICACION = "nueva_calificacion"
    PAGO_PENDIENTE = "pago_pendiente"
    PAGO_RECIBIDO = "pago_recibido"
    PROPIEDAD_FAVORITA_ACTUALIZADA = "propiedad_favorita_actualizada"
    RECORDATORIO_VISITA = "recordatorio_visita"
    NUEVO_REPORTE = "nuevo_reporte"


class NotificacionResponse(BaseModel):
    id_notificacion: int
    tipo: str
    titulo: str
    mensaje: str
    leida: bool
    fecha_creacion: datetime
    
    # Datos adicionales opcionales según el tipo
    id_relacionado: Optional[int] = None  # ID de renta, mensaje, etc.
    url_accion: Optional[str] = None  # URL a donde llevar al usuario
    
    class Config:
        from_attributes = True


class NotificacionCreate(BaseModel):
    tipo: TipoNotificacion
    titulo: str
    mensaje: str
    id_relacionado: Optional[int] = None


class ConfiguracionNotificaciones(BaseModel):
    email_nuevas_solicitudes: bool = True
    email_mensajes: bool = True
    email_calificaciones: bool = True
    email_pagos: bool = True
    push_nuevas_solicitudes: bool = True
    push_mensajes: bool = True
    push_calificaciones: bool = True
    push_pagos: bool = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/notificaciones", response_model=List[NotificacionResponse])
async def obtener_notificaciones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
    solo_no_leidas: bool = False,
    limit: int = 50,
    offset: int = 0
):
    """
    Obtener notificaciones del usuario
    
    - **solo_no_leidas**: Si es True, solo retorna notificaciones no leídas
    - **limit**: Cantidad máxima de notificaciones (default: 50)
    - **offset**: Offset para paginación (default: 0)
    """
    
    # Implementar query a la tabla notificaciones
    query = db.query(Notificacion).filter(
        Notificacion.id_usuario == current_user.id_usuario
    )
    
    if solo_no_leidas:
        query = query.filter(Notificacion.leida == False)
    
    notificaciones = query.order_by(
        Notificacion.fecha_creacion.desc()
    ).limit(limit).offset(offset).all()
    
    return [
        NotificacionResponse(
            id_notificacion=n.id_notificacion,
            tipo=n.tipo.value if hasattr(n.tipo, 'value') else str(n.tipo),
            titulo=n.titulo,
            mensaje=n.mensaje,
            leida=n.leida,
            fecha_creacion=n.fecha_creacion,
            id_relacionado=n.id_relacionado,
            url_accion=n.url_accion
        )
        for n in notificaciones
    ]


@router.get("/notificaciones/no-leidas/count")
async def contar_notificaciones_no_leidas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener cantidad de notificaciones no leídas
    
    Útil para mostrar badge en la UI
    """
    
    count = db.query(Notificacion).filter(
        Notificacion.id_usuario == current_user.id_usuario,
        Notificacion.leida == False
    ).count()
    
    return {"count": count}


@router.put("/notificaciones/{id_notificacion}/marcar-leida")
async def marcar_notificacion_leida(
    id_notificacion: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marcar una notificación como leída
    """
    
    notificacion = db.query(Notificacion).filter(
        Notificacion.id_notificacion == id_notificacion,
        Notificacion.id_usuario == current_user.id_usuario
    ).first()
    
    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    notificacion.leida = True
    db.commit()
    
    return {"message": "Notificación marcada como leída"}


@router.put("/notificaciones/marcar-todas-leidas")
async def marcar_todas_leidas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marcar todas las notificaciones del usuario como leídas
    """
    
    db.query(Notificacion).filter(
        Notificacion.id_usuario == current_user.id_usuario,
        Notificacion.leida == False
    ).update({"leida": True})
    db.commit()
    
    return {"message": "Todas las notificaciones marcadas como leídas"}


@router.delete("/notificaciones/{id_notificacion}")
async def eliminar_notificacion(
    id_notificacion: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar una notificación
    """
    
    notificacion = db.query(Notificacion).filter(
        Notificacion.id_notificacion == id_notificacion,
        Notificacion.id_usuario == current_user.id_usuario
    ).first()
    
    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    db.delete(notificacion)
    db.commit()
    
    return {"message": "Notificación eliminada exitosamente"}


@router.delete("/notificaciones/eliminar-todas")
async def eliminar_todas_notificaciones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar todas las notificaciones del usuario
    """
    
    db.query(Notificacion).filter(
        Notificacion.id_usuario == current_user.id_usuario
    ).delete()
    db.commit()
    
    return {"message": "Todas las notificaciones eliminadas"}


# ============================================================================
# CONFIGURACIÓN DE NOTIFICACIONES
# ============================================================================

@router.get("/notificaciones/configuracion", response_model=ConfiguracionNotificaciones)
async def obtener_configuracion_notificaciones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener configuración de notificaciones del usuario
    
    Retorna preferencias sobre qué notificaciones recibir por email y push
    """
    
    # Implementar tabla de configuración de notificaciones
    config = db.query(ConfiguracionNotificacionesUsuario).filter(
        ConfiguracionNotificacionesUsuario.id_usuario == current_user.id_usuario
    ).first()
    
    if not config:
        # Crear configuración por defecto
        config = ConfiguracionNotificacionesUsuario(
            id_usuario=current_user.id_usuario
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return ConfiguracionNotificaciones(
        email_nuevas_solicitudes=config.email_nuevas_solicitudes,
        email_mensajes=config.email_mensajes,
        email_calificaciones=config.email_calificaciones,
        email_pagos=config.email_pagos,
        push_nuevas_solicitudes=config.push_nuevas_solicitudes,
        push_mensajes=config.push_mensajes,
        push_calificaciones=config.push_calificaciones,
        push_pagos=config.push_pagos
    )


@router.put("/notificaciones/configuracion", response_model=ConfiguracionNotificaciones)
async def actualizar_configuracion_notificaciones(
    config_data: ConfiguracionNotificaciones,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar configuración de notificaciones del usuario
    
    Permite habilitar/deshabilitar diferentes tipos de notificaciones
    """
    
    config = db.query(ConfiguracionNotificacionesUsuario).filter(
        ConfiguracionNotificacionesUsuario.id_usuario == current_user.id_usuario
    ).first()
    
    if not config:
        config = ConfiguracionNotificacionesUsuario(
            id_usuario=current_user.id_usuario,
            **config_data.model_dump()
        )
        db.add(config)
    else:
        for key, value in config_data.model_dump().items():
            setattr(config, key, value)
    
    db.commit()
    db.refresh(config)
    
    return config_data


# ============================================================================
# FUNCIONES HELPER (para usar en otros routers)
# ============================================================================

async def crear_notificacion(
    db: Session,
    id_usuario: str,  # UUID como string
    tipo: TipoNotificacionEnum,
    titulo: str,
    mensaje: str,
    id_relacionado: Optional[int] = None,
    url_accion: Optional[str] = None
):
    """
    Función helper para crear notificaciones desde otros módulos
    
    Ejemplo de uso en otro router:
    ```python
    from app.routers.notificaciones import crear_notificacion
    from app.models.mensajes_notificaciones_pagos import TipoNotificacion
    
    # Cuando se aprueba una renta:
    await crear_notificacion(
        db=db,
        id_usuario=str(renta.id_estudiante),
        tipo=TipoNotificacion.RENTA_APROBADA,
        titulo="¡Renta Aprobada!",
        mensaje=f"Tu solicitud para {propiedad.titulo} ha sido aprobada",
        id_relacionado=renta.id_renta,
        url_accion=f"/rentas/{renta.id_renta}"
    )
    ```
    """
    
    # Crear notificación
    nueva_notificacion = Notificacion(
        id_usuario=id_usuario,
        tipo=tipo,
        titulo=titulo,
        mensaje=mensaje,
        id_relacionado=id_relacionado,
        url_accion=url_accion,
        leida=False
    )
    db.add(nueva_notificacion)
    db.commit()
    
    # TODO: Si el usuario tiene habilitadas notificaciones push, enviar
    # config = db.query(ConfiguracionNotificacionesUsuario).filter(
    #     ConfiguracionNotificacionesUsuario.id_usuario == id_usuario
    # ).first()
    # if config and config.push_nuevas_solicitudes:
    #     await enviar_push_notification(id_usuario, titulo, mensaje)
    
    # TODO: Si el usuario tiene habilitadas notificaciones por email, enviar
    # if config and config.email_nuevas_solicitudes:
    #     await enviar_email_notification(usuario.email, titulo, mensaje)
    
    return nueva_notificacion