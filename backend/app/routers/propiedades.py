"""
Router para propiedades con sistema de universidades completo
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.propiedad import Propiedad
from app.models.usuario import Usuario
from app.schemas.propiedad import PropiedadCreate, PropiedadResponse, PropiedadUpdate
from app.utils.dependencies import get_current_user, get_current_arrendador
from app.utils.universidades import (
    get_coordenadas_universidad, 
    get_universidades_nombres,
    buscar_universidades
)
import math

router = APIRouter(prefix="/propiedades")


def calcular_distancia(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
    Retorna la distancia en kilómetros
    """
    R = 6371  # Radio de la Tierra en km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distancia = R * c
    
    return distancia


@router.get("/universidades", response_model=List[dict])
def get_universidades():
    """
    Obtener lista de todas las universidades disponibles
    """
    return get_universidades_nombres()


@router.get("/universidades/buscar")
def buscar_universidades_endpoint(q: str = Query(..., min_length=2)):
    """
    Buscar universidades por nombre (para autocomplete)
    """
    return buscar_universidades(q)


@router.get("/", response_model=List[dict])
def get_propiedades(
    skip: int = 0,
    limit: int = 100,
    universidad: Optional[str] = Query(None, description="Filtrar por cercanía a universidad"),
    distancia_max: Optional[float] = Query(5.0, description="Distancia máxima en km"),
    precio_min: Optional[float] = Query(None),
    precio_max: Optional[float] = Query(None),
    tipo: Optional[str] = Query(None),
    num_habitaciones: Optional[int] = Query(None),
    disponible: bool = Query(True, description="Mostrar solo disponibles"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener lista de propiedades con filtros opcionales
    
    Si se proporciona una universidad, las propiedades se ordenan por distancia
    """
    
    # Query base
    query = db.query(Propiedad)
    
    # Filtrar por disponibilidad
    if disponible:
        query = query.filter(Propiedad.disponibilidad == "disponible")
    
    # Filtrar por tipo
    if tipo:
        query = query.filter(Propiedad.tipo == tipo)
    
    # Filtrar por precio
    if precio_min is not None:
        query = query.filter(Propiedad.precio >= precio_min)
    if precio_max is not None:
        query = query.filter(Propiedad.precio <= precio_max)
    
    # Filtrar por habitaciones
    if num_habitaciones is not None:
        query = query.filter(Propiedad.num_habitaciones >= num_habitaciones)
    
    propiedades = query.offset(skip).limit(limit).all()
    
    # Si se especifica universidad, calcular distancias y ordenar
    if universidad:
        uni_coords = get_coordenadas_universidad(universidad)
        
        if not uni_coords:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Universidad no encontrada: {universidad}"
            )
        
        propiedades_con_distancia = []
        for prop in propiedades:
            if prop.latitud and prop.longitud:
                distancia = calcular_distancia(
                    uni_coords["lat"],
                    uni_coords["lng"],
                    float(prop.latitud),
                    float(prop.longitud)
                )
                
                # Filtrar por distancia máxima
                if distancia <= distancia_max:
                    prop_dict = PropiedadResponse.model_validate(prop).model_dump()
                    prop_dict["distancia"] = round(distancia, 2)
                    prop_dict["universidad_referencia"] = uni_coords["nombre_completo"]
                    propiedades_con_distancia.append(prop_dict)
        
        # Ordenar por distancia
        propiedades_con_distancia.sort(key=lambda x: x["distancia"])
        return propiedades_con_distancia
    
    # Si no hay universidad, retornar sin distancia
    return [PropiedadResponse.model_validate(prop).model_dump() for prop in propiedades]


@router.get("/cercanas", response_model=List[dict])
def get_propiedades_cercanas_mi_universidad(
    current_user: Usuario = Depends(get_current_user),
    distancia_max: float = Query(5.0, description="Distancia máxima en km"),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """
    Obtener propiedades cercanas a la universidad del estudiante actual
    Este endpoint se usa en la página principal después del login
    """
    
    # Verificar que el usuario tenga perfil de estudiante
    if not current_user.perfil_estudiante:
        # Si no es estudiante, retornar propiedades generales
        propiedades = db.query(Propiedad).filter(
            Propiedad.disponibilidad == "disponible"
        ).limit(limit).all()
        return [PropiedadResponse.model_validate(prop).model_dump() for prop in propiedades]
    
    universidad_nombre = current_user.perfil_estudiante.universidad
    uni_coords = get_coordenadas_universidad(universidad_nombre)
    
    if not uni_coords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Universidad no reconocida: {universidad_nombre}"
        )
    
    # Obtener todas las propiedades disponibles
    propiedades = db.query(Propiedad).filter(
        Propiedad.disponibilidad == "disponible"
    ).all()
    
    propiedades_cercanas = []
    for prop in propiedades:
        if prop.latitud and prop.longitud:
            distancia = calcular_distancia(
                uni_coords["lat"],
                uni_coords["lng"],
                float(prop.latitud),
                float(prop.longitud)
            )
            
            if distancia <= distancia_max:
                prop_dict = PropiedadResponse.model_validate(prop).model_dump()
                prop_dict["distancia"] = round(distancia, 2)
                prop_dict["universidad_referencia"] = uni_coords["nombre_completo"]
                propiedades_cercanas.append(prop_dict)
    
    # Ordenar por distancia y limitar resultados
    propiedades_cercanas.sort(key=lambda x: x["distancia"])
    return propiedades_cercanas[:limit]


@router.get("/{id_propiedad}", response_model=dict)
def get_propiedad(
    id_propiedad: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener detalle de una propiedad específica
    Si el usuario es estudiante, incluye la distancia a su universidad
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    prop_dict = PropiedadResponse.model_validate(propiedad).model_dump()
    
    # Si el usuario es estudiante, calcular distancia a su universidad
    if current_user.perfil_estudiante and propiedad.latitud and propiedad.longitud:
        universidad_nombre = current_user.perfil_estudiante.universidad
        uni_coords = get_coordenadas_universidad(universidad_nombre)
        
        if uni_coords:
            distancia = calcular_distancia(
                uni_coords["lat"],
                uni_coords["lng"],
                float(propiedad.latitud),
                float(propiedad.longitud)
            )
            prop_dict["distancia"] = round(distancia, 2)
            prop_dict["universidad_referencia"] = uni_coords["nombre_completo"]
    
    return prop_dict


@router.post("/", response_model=PropiedadResponse, status_code=status.HTTP_201_CREATED)
def crear_propiedad(
    propiedad_data: PropiedadCreate,
    current_user: Usuario = Depends(get_current_arrendador),
    db: Session = Depends(get_db)
):
    """
    Crear una nueva propiedad (solo arrendadores)
    """
    nueva_propiedad = Propiedad(
        **propiedad_data.model_dump(),
        id_arrendador=current_user.id_usuario
    )
    
    db.add(nueva_propiedad)
    db.commit()
    db.refresh(nueva_propiedad)
    
    return nueva_propiedad


@router.put("/{id_propiedad}", response_model=PropiedadResponse)
def actualizar_propiedad(
    id_propiedad: int,
    propiedad_data: PropiedadUpdate,
    current_user: Usuario = Depends(get_current_arrendador),
    db: Session = Depends(get_db)
):
    """
    Actualizar una propiedad existente (solo el dueño)
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad
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
    for key, value in propiedad_data.model_dump(exclude_unset=True).items():
        setattr(propiedad, key, value)
    
    db.commit()
    db.refresh(propiedad)
    
    return propiedad


@router.delete("/{id_propiedad}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_propiedad(
    id_propiedad: int,
    current_user: Usuario = Depends(get_current_arrendador),
    db: Session = Depends(get_db)
):
    """
    Eliminar una propiedad (solo el dueño)
    """
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == id_propiedad
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
    
    db.delete(propiedad)
    db.commit()
    
    return None