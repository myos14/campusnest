"""
Router para Rentas y Reportes de Inquilinos
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.database import get_db
from app.models.usuario import Usuario
from app.models.propiedad import Propiedad
from app.models.renta_reporte import Renta, ReporteInquilino
from app.schemas.renta_reporte import (
    RentaCreate, RentaResponse, RentaUpdate,
    ReporteInquilinoCreate, ReporteInquilinoResponse, 
    ReporteInquilinoDetalle, ReporteInquilinoUpdate
)
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["rentas"])


# ============================================
# ENDPOINTS DE RENTAS
# ============================================

@router.post("/rentas", response_model=RentaResponse, status_code=status.HTTP_201_CREATED)
def crear_renta(
    renta_data: RentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear una nueva renta (arrendador registra que alguien rentó su propiedad)
    """
    # Verificar que el usuario sea arrendador
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden registrar rentas"
        )
    
    # Verificar que la propiedad exista y sea del arrendador
    propiedad = db.query(Propiedad).filter(
        Propiedad.id_propiedad == renta_data.id_propiedad,
        Propiedad.id_arrendador == current_user.id_usuario
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada o no te pertenece"
        )
    
    # Verificar que el estudiante exista
    estudiante = db.query(Usuario).filter(Usuario.id_usuario == renta_data.id_estudiante).first()
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Crear renta
    db_renta = Renta(
        id_estudiante=renta_data.id_estudiante,
        id_propiedad=renta_data.id_propiedad,
        id_arrendador=current_user.id_usuario,
        fecha_inicio=renta_data.fecha_inicio,
        fecha_fin=renta_data.fecha_fin,
        precio_acordado=renta_data.precio_acordado,
        estado_renta="activa"
    )
    
    db.add(db_renta)
    db.commit()
    db.refresh(db_renta)
    
    return db_renta


@router.get("/rentas/mis-rentas", response_model=List[RentaResponse])
def mis_rentas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    estado: Optional[str] = Query(None)
):
    """
    Ver rentas del usuario actual (como arrendador o estudiante)
    """
    query = db.query(Renta)
    
    # Si es arrendador, ver sus propiedades rentadas
    if current_user.tipo_usuario in ["arrendador", "ambos"]:
        query = query.filter(Renta.id_arrendador == current_user.id_usuario)
    else:
        # Si es estudiante, ver donde ha rentado
        query = query.filter(Renta.id_estudiante == current_user.id_usuario)
    
    if estado:
        query = query.filter(Renta.estado_renta == estado)
    
    rentas = query.order_by(Renta.fecha_creacion.desc()).all()
    return rentas


@router.put("/rentas/{id_renta}", response_model=RentaResponse)
def actualizar_renta(
    id_renta: int,
    renta_data: RentaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualizar renta (finalizar o cancelar)
    """
    renta = db.query(Renta).filter(Renta.id_renta == id_renta).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada"
        )
    
    # Verificar que el usuario sea el arrendador de la renta
    if renta.id_arrendador != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar esta renta"
        )
    
    # Actualizar campos
    if renta_data.fecha_fin:
        renta.fecha_fin = renta_data.fecha_fin
    
    if renta_data.estado_renta:
        renta.estado_renta = renta_data.estado_renta
    
    db.commit()
    db.refresh(renta)
    
    return renta


# ============================================
# ENDPOINTS DE REPORTES
# ============================================

@router.post("/reportes", response_model=ReporteInquilinoResponse, status_code=status.HTTP_201_CREATED)
def crear_reporte(
    reporte_data: ReporteInquilinoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear un reporte de inquilino problemático (solo arrendadores)
    """
    # Verificar que el usuario sea arrendador
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden crear reportes"
        )
    
    # Verificar que el estudiante reportado exista
    estudiante = db.query(Usuario).filter(
        Usuario.id_usuario == reporte_data.id_estudiante_reportado
    ).first()
    
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Si se proporciona id_renta, verificar que el arrendador sea el dueño
    if reporte_data.id_renta:
        renta = db.query(Renta).filter(
            Renta.id_renta == reporte_data.id_renta,
            Renta.id_arrendador == current_user.id_usuario
        ).first()
        
        if not renta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Renta no encontrada o no te pertenece"
            )
    
    # Crear reporte
    db_reporte = ReporteInquilino(
        id_arrendador=current_user.id_usuario,
        id_estudiante_reportado=reporte_data.id_estudiante_reportado,
        id_renta=reporte_data.id_renta,
        tipo_problema=reporte_data.tipo_problema,
        descripcion_detallada=reporte_data.descripcion_detallada,
        evidencias_urls=reporte_data.evidencias_urls,
        gravedad=reporte_data.gravedad,
        fecha_incidente=reporte_data.fecha_incidente,
        estado_reporte="pendiente",
        verificado_por_admin=False,
        visible_otros_arrendadores=False
    )
    
    db.add(db_reporte)
    db.commit()
    db.refresh(db_reporte)
    
    return db_reporte


@router.get("/reportes/estudiante/{id_estudiante}", response_model=List[ReporteInquilinoDetalle])
def obtener_reportes_estudiante(
    id_estudiante: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ver reportes de un estudiante (solo arrendadores verificados)
    """
    # Verificar que el usuario sea arrendador verificado
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden ver reportes"
        )
    
    # Por ahora permitimos a todos los arrendadores ver reportes
    # En producción, aquí verificarías current_user.verificado
    
    # Obtener reportes verificados y visibles
    reportes = db.query(ReporteInquilino).filter(
        and_(
            ReporteInquilino.id_estudiante_reportado == id_estudiante,
            ReporteInquilino.visible_otros_arrendadores == True,
            ReporteInquilino.verificado_por_admin == True
        )
    ).order_by(ReporteInquilino.fecha_reporte.desc()).all()
    
    # Enriquecer con información del estudiante y arrendador
    reportes_detalle = []
    for reporte in reportes:
        estudiante = db.query(Usuario).filter(Usuario.id_usuario == reporte.id_estudiante_reportado).first()
        arrendador = db.query(Usuario).filter(Usuario.id_usuario == reporte.id_arrendador).first()
        
        reporte_dict = ReporteInquilinoResponse.model_validate(reporte).model_dump()
        reporte_dict["estudiante_nombre"] = estudiante.nombre_completo if estudiante else None
        reporte_dict["estudiante_email"] = estudiante.email if estudiante else None
        reporte_dict["arrendador_nombre"] = arrendador.nombre_completo if arrendador else None
        
        reportes_detalle.append(ReporteInquilinoDetalle(**reporte_dict))
    
    return reportes_detalle


@router.get("/reportes/mis-reportes", response_model=List[ReporteInquilinoResponse])
def mis_reportes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ver reportes creados por el arrendador actual
    """
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden ver sus reportes"
        )
    
    reportes = db.query(ReporteInquilino).filter(
        ReporteInquilino.id_arrendador == current_user.id_usuario
    ).order_by(ReporteInquilino.fecha_reporte.desc()).all()
    
    return reportes


@router.put("/reportes/{id_reporte}", response_model=ReporteInquilinoResponse)
def actualizar_reporte(
    id_reporte: int,
    reporte_data: ReporteInquilinoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualizar reporte (moderación - solo para admins en producción)
    Por ahora, el dueño del reporte puede actualizarlo
    """
    reporte = db.query(ReporteInquilino).filter(
        ReporteInquilino.id_reporte == id_reporte
    ).first()
    
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte no encontrado"
        )
    
    # Verificar que el usuario sea el dueño del reporte
    if reporte.id_arrendador != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este reporte"
        )
    
    # Actualizar campos
    if reporte_data.estado_reporte:
        reporte.estado_reporte = reporte_data.estado_reporte
    
    if reporte_data.verificado_por_admin is not None:
        reporte.verificado_por_admin = reporte_data.verificado_por_admin
    
    if reporte_data.visible_otros_arrendadores is not None:
        reporte.visible_otros_arrendadores = reporte_data.visible_otros_arrendadores
    
    db.commit()
    db.refresh(reporte)
    
    return reporte