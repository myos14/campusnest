"""
Router para Favoritos - Guardar propiedades
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, text
from typing import List
from app.database import get_db
from app.models.usuario import Usuario
from app.models.propiedad import Propiedad
from app.schemas.propiedad import PropiedadDetalleResponse
from app.utils.dependencies import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/favoritos", tags=["Favoritos"])


@router.post("/{id_propiedad}", status_code=status.HTTP_201_CREATED)
def agregar_favorito(
    id_propiedad: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Agregar una propiedad a favoritos
    """
    # Verificar que la propiedad exista
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad,
        Propiedad.activa == True
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    # Verificar si ya existe en favoritos
    from sqlalchemy import text
    query = text("""
        SELECT * FROM favoritos 
        WHERE id_usuario = :user_id AND id_propiedad = :prop_id
    """)
    
    result = db.execute(
        query,
        {"user_id": str(current_user.id_usuario), "prop_id": id_propiedad}
    ).fetchone()
    
    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La propiedad ya está en favoritos"
        )
    
    # Agregar a favoritos
    insert_query = text("""
        INSERT INTO favoritos (id_usuario, id_propiedad, fecha_agregado)
        VALUES (:user_id, :prop_id, :fecha)
    """)
    
    db.execute(
        insert_query,
        {
            "user_id": str(current_user.id_usuario),
            "prop_id": id_propiedad,
            "fecha": datetime.utcnow()
        }
    )
    db.commit()
    
    return {"message": "Propiedad agregada a favoritos"}


@router.delete("/{id_propiedad}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_favorito(
    id_propiedad: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Eliminar una propiedad de favoritos
    """
    query = text("""
        DELETE FROM favoritos 
        WHERE id_usuario = :user_id AND id_propiedad = :prop_id
    """)
    
    result = db.execute(
        query,
        {"user_id": str(current_user.id_usuario), "prop_id": id_propiedad}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorito no encontrado"
        )
    
    return None


@router.get("", response_model=List[PropiedadDetalleResponse])
def mis_favoritos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener todas las propiedades favoritas del usuario
    """
    # Consulta con JOIN
    query = text("""
        SELECT p.* 
        FROM propiedades p
        INNER JOIN favoritos f ON p.id_propiedad = f.id_propiedad
        WHERE f.id_usuario = :user_id AND p.activa = true
        ORDER BY f.fecha_agregado DESC
    """)
    
    result = db.execute(query, {"user_id": str(current_user.id_usuario)})
    propiedades_ids = [row[0] for row in result]
    
    # Obtener propiedades completas con relaciones
    propiedades = db.query(Propiedad).filter(
        Propiedad.id_propiedad.in_(propiedades_ids)
    ).all()
    
    return propiedades


@router.get("/check/{id_propiedad}")
def verificar_favorito(
    id_propiedad: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Verificar si una propiedad está en favoritos
    """
    
    """ add from sqlalchemyy import text """
    query = text("""
        SELECT COUNT(*) as count FROM favoritos 
        WHERE id_usuario = :user_id AND id_propiedad = :prop_id
    """)
    
    result = db.execute(
        query,
        {"user_id": str(current_user.id_usuario), "prop_id": id_propiedad}
    ).fetchone()
    
    return {"es_favorito": result[0] > 0}