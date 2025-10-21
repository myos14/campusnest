"""
Router para mensajería entre usuarios
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.usuario import Usuario
from app.models.mensajes_notificaciones_pagos import Mensaje
from app.utils.dependencies import get_current_user

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class MensajeCreate(BaseModel):
    id_destinatario: str  # UUID como string
    contenido: str
    id_propiedad: Optional[int] = None


class MensajeResponse(BaseModel):
    id_mensaje: int
    id_remitente: str
    id_destinatario: str
    contenido: str
    leido: bool
    fecha_envio: datetime
    id_propiedad: Optional[int] = None
    
    class Config:
        from_attributes = True


class ConversacionResponse(BaseModel):
    id_usuario: str
    nombre_usuario: str
    foto_usuario: Optional[str] = None
    ultimo_mensaje: str
    fecha_ultimo_mensaje: datetime
    mensajes_no_leidos: int


# ============================================================================
# CONEXIONES WEBSOCKET ACTIVAS
# ============================================================================

class ConnectionManager:
    """
    Gestor de conexiones WebSocket para chat en tiempo real
    """
    def __init__(self):
        # Diccionario de conexiones activas: {user_id: websocket}
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

manager = ConnectionManager()


# ============================================================================
# ENDPOINTS HTTP
# ============================================================================

@router.post("/mensajes", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
async def enviar_mensaje(
    mensaje_data: MensajeCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enviar un mensaje a otro usuario
    
    - **id_destinatario**: ID del usuario que recibirá el mensaje
    - **contenido**: Contenido del mensaje
    - **id_propiedad**: (Opcional) Si el mensaje es sobre una propiedad específica
    """
    
    # Verificar que el destinatario existe
    destinatario = db.query(Usuario).filter(
        Usuario.id_usuario == mensaje_data.id_destinatario
    ).first()
    
    if not destinatario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario destinatario no encontrado"
        )
    
    # No puedes enviarte mensajes a ti mismo
    if str(mensaje_data.id_destinatario) == str(current_user.id_usuario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes enviarte mensajes a ti mismo"
        )
    
    # Crear mensaje en la base de datos
    nuevo_mensaje = Mensaje(
        id_remitente=current_user.id_usuario,
        id_destinatario=mensaje_data.id_destinatario,
        contenido=mensaje_data.contenido,
        id_propiedad=mensaje_data.id_propiedad,
        leido=False
    )
    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)
    
    # Enviar notificación en tiempo real si el destinatario está conectado
    await manager.send_personal_message(
        {
            "tipo": "nuevo_mensaje",
            "id_remitente": str(current_user.id_usuario),
            "remitente_nombre": current_user.nombre_completo,
            "contenido": mensaje_data.contenido,
            "fecha": datetime.utcnow().isoformat()
        },
        str(mensaje_data.id_destinatario)
    )
    
    return MensajeResponse(
        id_mensaje=nuevo_mensaje.id_mensaje,
        id_remitente=str(nuevo_mensaje.id_remitente),
        id_destinatario=str(nuevo_mensaje.id_destinatario),
        contenido=nuevo_mensaje.contenido,
        leido=nuevo_mensaje.leido,
        fecha_envio=nuevo_mensaje.fecha_envio,
        id_propiedad=nuevo_mensaje.id_propiedad
    )


@router.get("/mensajes/conversaciones", response_model=List[ConversacionResponse])
async def obtener_conversaciones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de conversaciones del usuario
    
    Retorna lista de usuarios con los que ha conversado,
    mostrando el último mensaje y cantidad de no leídos
    """
    
    # Obtener todos los usuarios con los que ha conversado
    mensajes = db.query(Mensaje).filter(
        or_(
            Mensaje.id_remitente == current_user.id_usuario,
            Mensaje.id_destinatario == current_user.id_usuario
        )
    ).all()
    
    # Agrupar por usuario
    conversaciones = {}
    for mensaje in mensajes:
        # Determinar el ID del otro usuario
        otro_usuario_id = (
            mensaje.id_destinatario 
            if mensaje.id_remitente == current_user.id_usuario 
            else mensaje.id_remitente
        )
        
        if str(otro_usuario_id) not in conversaciones:
            # Obtener datos del usuario
            otro_usuario = db.query(Usuario).filter(
                Usuario.id_usuario == otro_usuario_id
            ).first()
            
            if otro_usuario:
                conversaciones[str(otro_usuario_id)] = {
                    "id_usuario": str(otro_usuario.id_usuario),
                    "nombre_usuario": otro_usuario.nombre_completo,
                    "foto_usuario": otro_usuario.foto_perfil_url,
                    "ultimo_mensaje": mensaje.contenido,
                    "fecha_ultimo_mensaje": mensaje.fecha_envio,
                    "mensajes_no_leidos": 0
                }
        else:
            # Actualizar último mensaje si es más reciente
            if mensaje.fecha_envio > conversaciones[str(otro_usuario_id)]["fecha_ultimo_mensaje"]:
                conversaciones[str(otro_usuario_id)]["ultimo_mensaje"] = mensaje.contenido
                conversaciones[str(otro_usuario_id)]["fecha_ultimo_mensaje"] = mensaje.fecha_envio
    
    # Contar mensajes no leídos
    for user_id in conversaciones:
        count = db.query(Mensaje).filter(
            Mensaje.id_remitente == user_id,
            Mensaje.id_destinatario == current_user.id_usuario,
            Mensaje.leido == False
        ).count()
        conversaciones[user_id]["mensajes_no_leidos"] = count
    
    return list(conversaciones.values())


@router.get("/mensajes/conversacion/{id_usuario}", response_model=List[MensajeResponse])
async def obtener_conversacion(
    id_usuario: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """
    Obtener mensajes de una conversación específica
    
    - **id_usuario**: ID del otro usuario en la conversación
    - **limit**: Cantidad máxima de mensajes a retornar (default: 50)
    - **offset**: Offset para paginación (default: 0)
    """
    
    # Verificar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Obtener mensajes entre current_user y id_usuario
    mensajes = db.query(Mensaje).filter(
        or_(
            and_(
                Mensaje.id_remitente == current_user.id_usuario,
                Mensaje.id_destinatario == id_usuario
            ),
            and_(
                Mensaje.id_remitente == id_usuario,
                Mensaje.id_destinatario == current_user.id_usuario
            )
        )
    ).order_by(Mensaje.fecha_envio.desc()).limit(limit).offset(offset).all()
    
    # Marcar mensajes como leídos
    db.query(Mensaje).filter(
        Mensaje.id_remitente == id_usuario,
        Mensaje.id_destinatario == current_user.id_usuario,
        Mensaje.leido == False
    ).update({"leido": True})
    db.commit()
    
    return [
        MensajeResponse(
            id_mensaje=m.id_mensaje,
            id_remitente=str(m.id_remitente),
            id_destinatario=str(m.id_destinatario),
            contenido=m.contenido,
            leido=m.leido,
            fecha_envio=m.fecha_envio,
            id_propiedad=m.id_propiedad
        )
        for m in mensajes
    ]


@router.put("/mensajes/{id_mensaje}/marcar-leido")
async def marcar_mensaje_leido(
    id_mensaje: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marcar un mensaje como leído
    """
    
    mensaje = db.query(Mensaje).filter(
        Mensaje.id_mensaje == id_mensaje,
        Mensaje.id_destinatario == current_user.id_usuario
    ).first()
    
    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )
    
    mensaje.leido = True
    db.commit()
    
    return {"message": "Mensaje marcado como leído"}


@router.delete("/mensajes/{id_mensaje}")
async def eliminar_mensaje(
    id_mensaje: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un mensaje (solo el remitente)
    """
    
    mensaje = db.query(Mensaje).filter(
        Mensaje.id_mensaje == id_mensaje,
        Mensaje.id_remitente == current_user.id_usuario
    ).first()
    
    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )
    
    db.delete(mensaje)
    db.commit()
    
    return {"message": "Mensaje eliminado exitosamente"}


# ============================================================================
# WEBSOCKET ENDPOINT (Chat en tiempo real)
# ============================================================================

@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket para chat en tiempo real
    
    Conecta al usuario y mantiene la conexión abierta para
    recibir mensajes en tiempo real
    """
    
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            # Esperar mensajes del cliente
            data = await websocket.receive_json()
            
            # Procesar el mensaje según el tipo
            if data.get("tipo") == "mensaje":
                # Reenviar al destinatario si está conectado
                id_destinatario = data.get("id_destinatario")
                await manager.send_personal_message(data, id_destinatario)
            
            elif data.get("tipo") == "typing":
                # Notificar que el usuario está escribiendo
                id_destinatario = data.get("id_destinatario")
                await manager.send_personal_message(
                    {
                        "tipo": "typing",
                        "id_usuario": user_id,
                        "escribiendo": data.get("escribiendo", True)
                    },
                    id_destinatario
                )
    
    except WebSocketDisconnect:
        manager.disconnect(user_id)