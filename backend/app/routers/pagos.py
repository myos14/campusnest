"""
Router para gestión de pagos (Stripe/OpenPay)
NOTA: Este router está en modo MOCK. Para producción, descomentar integración real de Stripe.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

from app.database import get_db
from app.models.usuario import Usuario
from app.models.renta_reporte import Renta
from app.models.mensajes_notificaciones_pagos import Pago, EstadoPago, MetodoPago
from app.utils.dependencies import get_current_user, get_current_estudiante
from app.config import settings
from pydantic import BaseModel

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class PagoCreate(BaseModel):
    id_renta: int
    monto: float
    metodo_pago: str  # "stripe", "openpay", "transferencia", "efectivo"
    
class PagoConfirmar(BaseModel):
    payment_intent_id: str
    id_renta: int

class PagoResponse(BaseModel):
    id_pago: int
    id_renta: int
    monto: float
    metodo_pago: str
    estado: str  # "pendiente", "completado", "fallido", "reembolsado"
    fecha_pago: datetime
    referencia_externa: Optional[str] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/pagos/crear-intencion")
async def crear_intencion_pago(
    pago_data: PagoCreate,
    current_user: Usuario = Depends(get_current_estudiante),
    db: Session = Depends(get_db)
):
    """
    Crear intención de pago para una renta
    
    - **id_renta**: ID de la renta a pagar
    - **monto**: Monto a pagar
    - **metodo_pago**: stripe, openpay, transferencia, efectivo
    
    Retorna el client_secret para procesar el pago en frontend
    """
    
    # Verificar que la renta existe y pertenece al usuario
    renta = db.query(Renta).filter(
        Renta.id_renta == pago_data.id_renta,
        Renta.id_estudiante == current_user.id_usuario
    ).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada"
        )
    
    # Verificar que la renta esté en estado aprobado o activo
    if renta.estado not in ["aprobada", "activa"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La renta debe estar aprobada o activa para realizar pagos"
        )
    
    # Crear registro de pago en BD
    nuevo_pago = Pago(
        id_renta=pago_data.id_renta,
        monto=pago_data.monto,
        metodo_pago=MetodoPago(pago_data.metodo_pago),
        estado=EstadoPago.PENDIENTE,
        referencia_externa=None
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    
    # TODO: Integración real con Stripe/OpenPay
    if pago_data.metodo_pago == "stripe":
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stripe no está configurado"
            )
        
        # TODO: Descomentar cuando configures Stripe
        # import stripe
        # stripe.api_key = settings.STRIPE_SECRET_KEY
        # intent = stripe.PaymentIntent.create(
        #     amount=int(pago_data.monto * 100),  # Convertir a centavos
        #     currency="mxn",
        #     metadata={
        #         "id_renta": pago_data.id_renta,
        #         "id_usuario": str(current_user.id_usuario),
        #         "id_pago": nuevo_pago.id_pago
        #     }
        # )
        # 
        # # Actualizar pago con referencia de Stripe
        # nuevo_pago.referencia_externa = intent.id
        # db.commit()
        # 
        # return {
        #     "id_pago": nuevo_pago.id_pago,
        #     "client_secret": intent.client_secret,
        #     "payment_intent_id": intent.id
        # }
        
        # Mock response
        return {
            "id_pago": nuevo_pago.id_pago,
            "message": "Integración con Stripe pendiente de implementar",
            "client_secret": f"mock_client_secret_{nuevo_pago.id_pago}",
            "payment_intent_id": f"mock_pi_{nuevo_pago.id_pago}"
        }
    
    elif pago_data.metodo_pago == "openpay":
        # TODO: Integrar con OpenPay
        return {
            "id_pago": nuevo_pago.id_pago,
            "message": "Integración con OpenPay pendiente de implementar"
        }
    
    elif pago_data.metodo_pago == "transferencia":
        return {
            "id_pago": nuevo_pago.id_pago,
            "message": "Pago por transferencia registrado. Sube tu comprobante.",
            "cuenta_bancaria": "XXXXXXXXXXX"  # TODO: Configurar cuenta real
        }
    
    elif pago_data.metodo_pago == "efectivo":
        return {
            "id_pago": nuevo_pago.id_pago,
            "message": "Pago en efectivo registrado. Coordina con el arrendador."
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Método de pago no válido"
        )


@router.post("/pagos/confirmar")
async def confirmar_pago(
    confirmacion: PagoConfirmar,
    current_user: Usuario = Depends(get_current_estudiante),
    db: Session = Depends(get_db)
):
    """
    Confirmar un pago realizado
    
    - **payment_intent_id**: ID de la intención de pago de Stripe/OpenPay
    - **id_renta**: ID de la renta asociada
    
    Marca el pago como completado y actualiza el estado de la renta
    """
    
    # Verificar que la renta pertenece al usuario
    renta = db.query(Renta).filter(
        Renta.id_renta == confirmacion.id_renta,
        Renta.id_estudiante == current_user.id_usuario
    ).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada"
        )
    
    # Buscar el pago
    pago = db.query(Pago).filter(
        Pago.id_renta == confirmacion.id_renta,
        Pago.estado == EstadoPago.PENDIENTE
    ).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un pago pendiente para esta renta"
        )
    
    # TODO: Verificar el pago con Stripe/OpenPay
    # import stripe
    # stripe.api_key = settings.STRIPE_SECRET_KEY
    # payment_intent = stripe.PaymentIntent.retrieve(confirmacion.payment_intent_id)
    # 
    # if payment_intent.status != "succeeded":
    #     pago.estado = EstadoPago.FALLIDO
    #     db.commit()
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="El pago no fue exitoso"
    #     )
    
    # Marcar pago como completado
    pago.estado = EstadoPago.COMPLETADO
    pago.referencia_externa = confirmacion.payment_intent_id
    db.commit()
    
    # TODO: Crear notificación para el arrendador
    # from app.routers.notificaciones import crear_notificacion
    # from app.models.mensajes_notificaciones_pagos import TipoNotificacion
    # await crear_notificacion(
    #     db=db,
    #     id_usuario=str(renta.propiedad.id_arrendador),
    #     tipo=TipoNotificacion.PAGO_RECIBIDO,
    #     titulo="Pago recibido",
    #     mensaje=f"Has recibido un pago de ${pago.monto} por la renta",
    #     id_relacionado=pago.id_pago
    # )
    
    return {
        "message": "Pago confirmado exitosamente",
        "id_pago": pago.id_pago,
        "id_renta": confirmacion.id_renta,
        "payment_intent_id": confirmacion.payment_intent_id
    }


@router.get("/pagos/historial", response_model=List[PagoResponse])
async def obtener_historial_pagos(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener historial de pagos del usuario
    
    Estudiantes ven sus pagos realizados
    Arrendadores ven pagos recibidos
    """
    
    if current_user.tipo_usuario in ["estudiante", "ambos"]:
        # Pagos realizados por el estudiante
        rentas = db.query(Renta).filter(
            Renta.id_estudiante == current_user.id_usuario
        ).all()
        
        renta_ids = [r.id_renta for r in rentas]
        
        pagos = db.query(Pago).filter(
            Pago.id_renta.in_(renta_ids)
        ).order_by(Pago.fecha_pago.desc()).all()
        
    elif current_user.tipo_usuario == "arrendador":
        # Pagos recibidos por el arrendador
        # TODO: Necesitas agregar relación en modelo Propiedad
        # propiedades = db.query(Propiedad).filter(
        #     Propiedad.id_arrendador == current_user.id_usuario
        # ).all()
        # 
        # propiedad_ids = [p.id_propiedad for p in propiedades]
        # 
        # rentas = db.query(Renta).filter(
        #     Renta.id_propiedad.in_(propiedad_ids)
        # ).all()
        # 
        # renta_ids = [r.id_renta for r in rentas]
        # 
        # pagos = db.query(Pago).filter(
        #     Pago.id_renta.in_(renta_ids)
        # ).order_by(Pago.fecha_pago.desc()).all()
        
        pagos = []  # Temporal hasta agregar relación
    
    else:
        pagos = []
    
    return [
        PagoResponse(
            id_pago=p.id_pago,
            id_renta=p.id_renta,
            monto=p.monto,
            metodo_pago=p.metodo_pago.value if hasattr(p.metodo_pago, 'value') else str(p.metodo_pago),
            estado=p.estado.value if hasattr(p.estado, 'value') else str(p.estado),
            fecha_pago=p.fecha_pago,
            referencia_externa=p.referencia_externa
        )
        for p in pagos
    ]


@router.get("/pagos/{id_pago}", response_model=PagoResponse)
async def obtener_detalle_pago(
    id_pago: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de un pago específico
    """
    
    pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    # Verificar que el usuario tiene permiso para ver este pago
    renta = db.query(Renta).filter(Renta.id_renta == pago.id_renta).first()
    
    if not renta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renta no encontrada"
        )
    
    # Verificar que es el estudiante que hizo la renta o el arrendador de la propiedad
    # TODO: Agregar verificación de arrendador cuando tengas la relación
    if renta.id_estudiante != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este pago"
        )
    
    return PagoResponse(
        id_pago=pago.id_pago,
        id_renta=pago.id_renta,
        monto=pago.monto,
        metodo_pago=pago.metodo_pago.value if hasattr(pago.metodo_pago, 'value') else str(pago.metodo_pago),
        estado=pago.estado.value if hasattr(pago.estado, 'value') else str(pago.estado),
        fecha_pago=pago.fecha_pago,
        referencia_externa=pago.referencia_externa
    )


# ============================================================================
# WEBHOOKS (Para producción con Stripe)
# ============================================================================

# TODO: Implementar webhook de Stripe para confirmaciones automáticas
# @router.post("/pagos/webhook")
# async def webhook_stripe(request: Request, db: Session = Depends(get_db)):
#     """
#     Webhook para recibir eventos de Stripe
#     """
#     import stripe
#     
#     payload = await request.body()
#     sig_header = request.headers.get('stripe-signature')
#     
#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
#         )
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     
#     # Manejar diferentes tipos de eventos
#     if event['type'] == 'payment_intent.succeeded':
#         payment_intent = event['data']['object']
#         
#         # Actualizar pago en BD
#         pago = db.query(Pago).filter(
#             Pago.referencia_externa == payment_intent['id']
#         ).first()
#         
#         if pago:
#             pago.estado = EstadoPago.COMPLETADO
#             db.commit()
#     
#     return {"status": "success"}