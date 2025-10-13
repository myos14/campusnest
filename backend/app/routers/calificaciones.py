"""
Router para Calificaciones Bidireccionales
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List
from app.database import get_db
from app.models.usuario import Usuario
from app.models.renta_reporte import Renta
from app.schemas.calificaciones import (
    CalificacionPropiedadCreate, CalificacionPropiedadResponse, CalificacionPropiedadDetalle,
    CalificacionInquilinoCreate, CalificacionInquilinoResponse, CalificacionInquilinoDetalle,
    EstadisticasPropiedad, EstadisticasInquilino
)
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/calificaciones", tags=["Calificaciones"])


# ============================================
# CALIFICACIONES DE PROPIEDADES
# ============================================

@router.post("/propiedad", response_model=CalificacionPropiedadResponse, status_code=status.HTTP_201_CREATED)
def calificar_propiedad(
    calificacion_data: CalificacionPropiedadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Calificar una propiedad (solo quien rentó puede calificar)
    """
    # Verificar que la renta exista y sea del usuario
    renta = db.query(Renta).filter(
        Renta.id_renta == calificacion_data.id_renta,
        Renta.id_estudiante == current_user.id_usuario,
        Renta.estado_renta == "finalizada"
    ).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada o no está finalizada"
        )
    
    # Verificar si ya calificó esta renta
    check_query = text("""
        SELECT COUNT(*) FROM calificaciones_propiedad 
        WHERE id_renta = :renta_id AND id_estudiante = :user_id
    """)
    
    result = db.execute(
        check_query,
        {"renta_id": calificacion_data.id_renta, "user_id": str(current_user.id_usuario)}
    ).fetchone()
    
    if result[0] > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya calificaste esta propiedad"
        )
    
    # Crear calificación
    insert_query = text("""
        INSERT INTO calificaciones_propiedad (
            id_renta, id_estudiante, id_propiedad,
            calificacion_general, calificacion_limpieza, calificacion_ubicacion,
            calificacion_precio, calificacion_comunicacion, comentario,
            fecha_calificacion, visible
        ) VALUES (
            :id_renta, :id_estudiante, :id_propiedad,
            :cal_general, :cal_limpieza, :cal_ubicacion,
            :cal_precio, :cal_comunicacion, :comentario,
            :fecha, true
        )
        RETURNING id_calificacion
    """)
    
    result = db.execute(
        insert_query,
        {
            "id_renta": calificacion_data.id_renta,
            "id_estudiante": str(current_user.id_usuario),
            "id_propiedad": str(renta.id_propiedad),
            "cal_general": calificacion_data.calificacion_general,
            "cal_limpieza": calificacion_data.calificacion_limpieza,
            "cal_ubicacion": calificacion_data.calificacion_ubicacion,
            "cal_precio": calificacion_data.calificacion_precio,
            "cal_comunicacion": calificacion_data.calificacion_comunicacion,
            "comentario": calificacion_data.comentario,
            "fecha": datetime.utcnow()
        }
    )
    db.commit()
    
    id_calificacion = result.fetchone()[0]
    
    # Obtener calificación creada
    select_query = text("""
        SELECT * FROM calificaciones_propiedad WHERE id_calificacion = :id
    """)
    
    calificacion = db.execute(select_query, {"id": id_calificacion}).fetchone()
    
    return CalificacionPropiedadResponse(
        id_calificacion=calificacion[0],
        id_renta=calificacion[1],
        id_estudiante=calificacion[2],
        id_propiedad=calificacion[3],
        calificacion_general=calificacion[4],
        calificacion_limpieza=calificacion[5],
        calificacion_ubicacion=calificacion[6],
        calificacion_precio=calificacion[7],
        calificacion_comunicacion=calificacion[8],
        comentario=calificacion[9],
        fecha_calificacion=calificacion[10],
        visible=calificacion[11]
    )


@router.get("/propiedad/{id_propiedad}", response_model=List[CalificacionPropiedadDetalle])
def obtener_calificaciones_propiedad(
    id_propiedad: str,
    db: Session = Depends(get_db)
):
    """
    Obtener todas las calificaciones de una propiedad
    """
    query = text("""
        SELECT cp.*, u.nombre_completo
        FROM calificaciones_propiedad cp
        INNER JOIN usuarios u ON cp.id_estudiante = u.id_usuario
        WHERE cp.id_propiedad = :prop_id AND cp.visible = true
        ORDER BY cp.fecha_calificacion DESC
    """)
    
    result = db.execute(query, {"prop_id": id_propiedad}).fetchall()
    
    calificaciones = []
    for row in result:
        calificaciones.append(CalificacionPropiedadDetalle(
            id_calificacion=row[0],
            id_renta=row[1],
            id_estudiante=row[2],
            id_propiedad=row[3],
            calificacion_general=row[4],
            calificacion_limpieza=row[5],
            calificacion_ubicacion=row[6],
            calificacion_precio=row[7],
            calificacion_comunicacion=row[8],
            comentario=row[9],
            fecha_calificacion=row[10],
            visible=row[11],
            estudiante_nombre=row[12]
        ))
    
    return calificaciones


@router.get("/propiedad/{id_propiedad}/estadisticas", response_model=EstadisticasPropiedad)
def estadisticas_propiedad(
    id_propiedad: str,
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de calificaciones de una propiedad
    """
    query = text("""
        SELECT 
            COUNT(*) as total,
            ROUND(AVG(calificacion_general), 1) as prom_general,
            ROUND(AVG(calificacion_limpieza), 1) as prom_limpieza,
            ROUND(AVG(calificacion_ubicacion), 1) as prom_ubicacion,
            ROUND(AVG(calificacion_precio), 1) as prom_precio,
            ROUND(AVG(calificacion_comunicacion), 1) as prom_comunicacion
        FROM calificaciones_propiedad
        WHERE id_propiedad = :prop_id AND visible = true
    """)
    
    result = db.execute(query, {"prop_id": id_propiedad}).fetchone()
    
    if result[0] == 0:
        return EstadisticasPropiedad(
            id_propiedad=id_propiedad,
            total_calificaciones=0,
            promedio_general=0.0,
            promedio_limpieza=0.0,
            promedio_ubicacion=0.0,
            promedio_precio=0.0,
            promedio_comunicacion=0.0
        )
    
    return EstadisticasPropiedad(
        id_propiedad=id_propiedad,
        total_calificaciones=result[0],
        promedio_general=float(result[1] or 0),
        promedio_limpieza=float(result[2] or 0),
        promedio_ubicacion=float(result[3] or 0),
        promedio_precio=float(result[4] or 0),
        promedio_comunicacion=float(result[5] or 0)
    )


# ============================================
# CALIFICACIONES DE INQUILINOS
# ============================================

@router.post("/inquilino", response_model=CalificacionInquilinoResponse, status_code=status.HTTP_201_CREATED)
def calificar_inquilino(
    calificacion_data: CalificacionInquilinoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Calificar un inquilino (solo arrendadores que finalizaron una renta)
    """
    # Verificar que sea arrendador
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden calificar inquilinos"
        )
    
    # Verificar que la renta exista y sea del usuario
    renta = db.query(Renta).filter(
        Renta.id_renta == calificacion_data.id_renta,
        Renta.id_arrendador == current_user.id_usuario,
        Renta.estado_renta == "finalizada"
    ).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada o no está finalizada"
        )
    
    # Verificar si ya calificó
    check_query = text("""
        SELECT COUNT(*) FROM calificaciones_inquilino 
        WHERE id_renta = :renta_id AND id_arrendador = :user_id
    """)
    
    result = db.execute(
        check_query,
        {"renta_id": calificacion_data.id_renta, "user_id": str(current_user.id_usuario)}
    ).fetchone()
    
    if result[0] > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya calificaste a este inquilino"
        )
    
    # Crear calificación
    insert_query = text("""
        INSERT INTO calificaciones_inquilino (
            id_renta, id_arrendador, id_estudiante,
            calificacion_general, calificacion_pago_puntual, calificacion_cuidado_propiedad,
            calificacion_convivencia, calificacion_comunicacion, comentario,
            fecha_calificacion, visible
        ) VALUES (
            :id_renta, :id_arrendador, :id_estudiante,
            :cal_general, :cal_pago, :cal_cuidado,
            :cal_convivencia, :cal_comunicacion, :comentario,
            :fecha, true
        )
        RETURNING id_calificacion_inquilino
    """)
    
    result = db.execute(
        insert_query,
        {
            "id_renta": calificacion_data.id_renta,
            "id_arrendador": str(current_user.id_usuario),
            "id_estudiante": str(renta.id_estudiante),
            "cal_general": calificacion_data.calificacion_general,
            "cal_pago": calificacion_data.calificacion_pago_puntual,
            "cal_cuidado": calificacion_data.calificacion_cuidado_propiedad,
            "cal_convivencia": calificacion_data.calificacion_convivencia,
            "cal_comunicacion": calificacion_data.calificacion_comunicacion,
            "comentario": calificacion_data.comentario,
            "fecha": datetime.utcnow()
        }
    )
    db.commit()
    
    id_calificacion = result.fetchone()[0]
    
    # Obtener calificación creada
    select_query = text("""
        SELECT * FROM calificaciones_inquilino WHERE id_calificacion_inquilino = :id
    """)
    
    calificacion = db.execute(select_query, {"id": id_calificacion}).fetchone()
    
    return CalificacionInquilinoResponse(
        id_calificacion_inquilino=calificacion[0],
        id_renta=calificacion[1],
        id_arrendador=calificacion[2],
        id_estudiante=calificacion[3],
        calificacion_general=calificacion[4],
        calificacion_pago_puntual=calificacion[5],
        calificacion_cuidado_propiedad=calificacion[6],
        calificacion_convivencia=calificacion[7],
        calificacion_comunicacion=calificacion[8],
        comentario=calificacion[9],
        fecha_calificacion=calificacion[10],
        visible=calificacion[11]
    )


@router.get("/inquilino/{id_estudiante}", response_model=List[CalificacionInquilinoDetalle])
def obtener_calificaciones_inquilino(
    id_estudiante: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener calificaciones de un inquilino (solo arrendadores verificados)
    """
    # Verificar que sea arrendador
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden ver calificaciones de inquilinos"
        )
    
    query = text("""
        SELECT ci.*, u.nombre_completo
        FROM calificaciones_inquilino ci
        INNER JOIN usuarios u ON ci.id_arrendador = u.id_usuario
        WHERE ci.id_estudiante = :est_id AND ci.visible = true
        ORDER BY ci.fecha_calificacion DESC
    """)
    
    result = db.execute(query, {"est_id": id_estudiante}).fetchall()
    
    calificaciones = []
    for row in result:
        calificaciones.append(CalificacionInquilinoDetalle(
            id_calificacion_inquilino=row[0],
            id_renta=row[1],
            id_arrendador=row[2],
            id_estudiante=row[3],
            calificacion_general=row[4],
            calificacion_pago_puntual=row[5],
            calificacion_cuidado_propiedad=row[6],
            calificacion_convivencia=row[7],
            calificacion_comunicacion=row[8],
            comentario=row[9],
            fecha_calificacion=row[10],
            visible=row[11],
            arrendador_nombre=row[12]
        ))
    
    return calificaciones


@router.get("/inquilino/{id_estudiante}/estadisticas", response_model=EstadisticasInquilino)
def estadisticas_inquilino(
    id_estudiante: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener estadísticas de calificaciones de un inquilino
    """
    # Verificar que sea arrendador
    if current_user.tipo_usuario not in ["arrendador", "ambos"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo arrendadores pueden ver estadísticas de inquilinos"
        )
    
    query = text("""
        SELECT 
            COUNT(*) as total,
            ROUND(AVG(calificacion_general), 1) as prom_general,
            ROUND(AVG(calificacion_pago_puntual), 1) as prom_pago,
            ROUND(AVG(calificacion_cuidado_propiedad), 1) as prom_cuidado,
            ROUND(AVG(calificacion_convivencia), 1) as prom_convivencia,
            ROUND(AVG(calificacion_comunicacion), 1) as prom_comunicacion
        FROM calificaciones_inquilino
        WHERE id_estudiante = :est_id AND visible = true
    """)
    
    result = db.execute(query, {"est_id": id_estudiante}).fetchone()
    
    if result[0] == 0:
        return EstadisticasInquilino(
            id_estudiante=id_estudiante,
            total_calificaciones=0,
            promedio_general=0.0,
            promedio_pago_puntual=0.0,
            promedio_cuidado_propiedad=0.0,
            promedio_convivencia=0.0,
            promedio_comunicacion=0.0
        )
    
    return EstadisticasInquilino(
        id_estudiante=id_estudiante,
        total_calificaciones=result[0],
        promedio_general=float(result[1] or 0),
        promedio_pago_puntual=float(result[2] or 0),
        promedio_cuidado_propiedad=float(result[3] or 0),
        promedio_convivencia=float(result[4] or 0),
        promedio_comunicacion=float(result[5] or 0)
    )