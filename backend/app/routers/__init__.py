"""
Routers package - Endpoints de la API
"""

from app.routers.auth import router as auth_router

__all__ = [
    "auth_router"
]