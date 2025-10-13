"""
Router para propiedades - CRUD completo
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app.models.usuario import Usuario
from app.models.propiedad import Propiedad, CaracteristicaPropiedad, FotoPropiedad
from app.schemas.propiedad import (
    PropiedadCreate, PropiedadUpdate, PropiedadResponse, 
    PropiedadDetalleResponse, FotoPropiedadCreate, FotoPropiedadResponse
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/propiedades", tags=["propiedades"])


@router.post("", response_model=PropiedadDetalleResponse, status_code=status.HTTP_201_CREATED)
def crear_propiedad(
    propiedad_data: PropiedadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear una nueva propiedad (solo arrendadores o usuarios tipo 'ambos')
    """
    # Verificar que el usuario sea arrendador o ambos
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los arrendadores pueden publicar propiedades"
        )
    
    # Crear propiedad
    db_propiedad = Propiedad(
        id_arrendador=current_user.id_usuario,
        titulo=propiedad_data.titulo,
        descripcion=propiedad_data.descripcion,
        tipo_propiedad=propiedad_data.tipo_propiedad,
        precio_mensual=propiedad_data.precio_mensual,
        deposito_requerido=propiedad_data.deposito_requerido,
        direccion_completa=propiedad_data.direccion_completa,
        latitud=propiedad_data.latitud,
        longitud=propiedad_data.longitud,
        colonia=propiedad_data.colonia,
        codigo_postal=propiedad_data.codigo_postal,
        ciudad=propiedad_data.ciudad,
        estado=propiedad_data.estado,
        disponible=propiedad_data.disponible,
        fecha_disponibilidad=propiedad_data.fecha_disponibilidad,
    )
    
    db.add(db_propiedad)
    db.flush()
    
    # Crear características si se proporcionaron
    if propiedad_data.caracteristicas:
        caracteristicas = CaracteristicaPropiedad(
            id_propiedad=db_propiedad.id_propiedad,
            **propiedad_data.caracteristicas.model_dump()
        )
        db.add(caracteristicas)
    
    # Crear fotos si se proporcionaron
    if propiedad_data.fotos:
        for foto_data in propiedad_data.fotos:
            foto = FotoPropiedad(
                id_propiedad=db_propiedad.id_propiedad,
                **foto_data.model_dump()
            )
            db.add(foto)
    
    db.commit()
    db.refresh(db_propiedad)
    
    return db_propiedad


@router.get("", response_model=List[PropiedadDetalleResponse])
def listar_propiedades(
    db: Session = Depends(get_db),
    tipo_propiedad: Optional[str] = Query(None),
    precio_min: Optional[Decimal] = Query(None, ge=0),
    precio_max: Optional[Decimal] = Query(None, ge=0),
    ciudad: Optional[str] = Query("Puebla"),
    colonia: Optional[str] = Query(None),
    wifi: Optional[bool] = Query(None),
    amueblado: Optional[bool] = Query(None),
    mascotas_permitidas: Optional[bool] = Query(None),
    disponible: bool = Query(True),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Listar propiedades con filtros opcionales
    """
    query = db.query(Propiedad).filter(Propiedad.activa == True)
    
    # Aplicar filtros
    if disponible is not None:
        query = query.filter(Propiedad.disponible == disponible)
    
    if tipo_propiedad:
        query = query.filter(Propiedad.tipo_propiedad == tipo_propiedad)
    
    if precio_min is not None:
        query = query.filter(Propiedad.precio_mensual >= precio_min)
    
    if precio_max is not None:
        query = query.filter(Propiedad.precio_mensual <= precio_max)
    
    if ciudad:
        query = query.filter(Propiedad.ciudad.ilike(f"%{ciudad}%"))
    
    if colonia:
        query = query.filter(Propiedad.colonia.ilike(f"%{colonia}%"))
    
    # Filtros de características
    if wifi is not None or amueblado is not None or mascotas_permitidas is not None:
        query = query.join(CaracteristicaPropiedad)
        
        if wifi is not None:
            query = query.filter(CaracteristicaPropiedad.wifi == wifi)
        
        if amueblado is not None:
            query = query.filter(CaracteristicaPropiedad.amueblado == amueblado)
        
        if mascotas_permitidas is not None:
            query = query.filter(CaracteristicaPropiedad.mascotas_permitidas == mascotas_permitidas)
    
    # Ordenar por fecha de publicación (más recientes primero)
    query = query.order_by(Propiedad.fecha_publicacion.desc())
    
    # Paginación
    propiedades = query.offset(offset).limit(limit).all()
    
    return propiedades


@router.get("/{id_propiedad}", response_model=PropiedadDetalleResponse)
def obtener_propiedad(
    id_propiedad: str,
    db: Session = Depends(get_db)
):
    """
    Obtener detalle de una propiedad por ID
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad,
        Propiedad.activa == True
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    return propiedad


@router.put("/{id_propiedad}", response_model=PropiedadDetalleResponse)
def actualizar_propiedad(
    id_propiedad: str,
    propiedad_data: PropiedadUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualizar una propiedad (solo el dueño puede hacerlo)
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad,
        Propiedad.activa == True
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    # Verificar que el usuario sea el dueño
    if propiedad.id_arrendador != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar esta propiedad"
        )
    
    # Actualizar campos
    update_data = propiedad_data.model_dump(exclude_unset=True, exclude={"caracteristicas"})
    for field, value in update_data.items():
        setattr(propiedad, field, value)
    
    # Actualizar características si se proporcionaron
    if propiedad_data.caracteristicas:
        if propiedad.caracteristicas:
            # Actualizar características existentes
            for field, value in propiedad_data.caracteristicas.model_dump().items():
                setattr(propiedad.caracteristicas, field, value)
        else:
            # Crear nuevas características
            caracteristicas = CaracteristicaPropiedad(
                id_propiedad=propiedad.id_propiedad,
                **propiedad_data.caracteristicas.model_dump()
            )
            db.add(caracteristicas)
    
    db.commit()
    db.refresh(propiedad)
    
    return propiedad


@router.delete("/{id_propiedad}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_propiedad(
    id_propiedad: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Eliminar una propiedad (soft delete - marca como inactiva)
    Solo el dueño puede hacerlo
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad,
        Propiedad.activa == True
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    # Verificar que el usuario sea el dueño
    if propiedad.id_arrendador != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta propiedad"
        )
    
    # Soft delete
    propiedad.activa = False
    db.commit()
    
    return None


@router.post("/{id_propiedad}/fotos", response_model=FotoPropiedadResponse, status_code=status.HTTP_201_CREATED)
def agregar_foto(
    id_propiedad: str,
    foto_data: FotoPropiedadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Agregar una foto a una propiedad
    Solo el dueño puede hacerlo
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad,
        Propiedad.activa == True
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    # Verificar que el usuario sea el dueño
    if propiedad.id_arrendador != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para agregar fotos a esta propiedad"
        )
    
    # Si es foto principal, desmarcar las demás
    if foto_data.es_principal:
        db.query(FotoPropiedad).filter(
            FotoPropiedad.id_propiedad == id_propiedad
        ).update({"es_principal": False})
    
    # Crear foto
    foto = FotoPropiedad(
        id_propiedad=propiedad.id_propiedad,
        **foto_data.model_dump()
    )
    
    db.add(foto)
    db.commit()
    db.refresh(foto)
    
    return foto


@router.get("/mis-propiedades", response_model=List[PropiedadDetalleResponse])
def mis_propiedades(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener todas las propiedades del usuario autenticado
    """
    propiedades = db.query(Propiedad).filter(
        Propiedad.id_arrendador == current_user.id_usuario,
        Propiedad.activa == True
    ).order_by(Propiedad.fecha_publicacion.desc()).all()
    
    return propiedades