"""
Routers package - Endpoints de la API
"""

from app.routers.auth import router as auth_router
from app.routers.propiedades import router as propiedades_router
from app.routers.rentas import router as rentas_router
from app.routers.favoritos import router as favoritos_router
from app.routers.calificaciones import router as calificaciones_router

__all__ = [
    "auth_router",
    "propiedades_router", 
    "rentas_router",
    "favoritos_router",
    "calificaciones_router"
]