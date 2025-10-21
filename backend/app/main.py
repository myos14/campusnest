"""
Main application file - CampusNest API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# ============================================================================
# IMPORTS DE ROUTERS - TODOS LOS MÓDULOS
# ============================================================================

from app.routers import (
    auth,              # Router de autenticación
    propiedades,       # Router de propiedades
    rentas,            # Router de rentas y reportes
    favoritos,         # Router de favoritos
    calificaciones,    # Router de calificaciones
    upload,            # Router de upload de imágenes (NUEVO)
    pagos,             # Router de pagos (NUEVO)
    mensajes,          # Router de mensajería (NUEVO)
    notificaciones     # Router de notificaciones (NUEVO)
)

# ============================================================================
# CREAR INSTANCIA DE FASTAPI
# ============================================================================

app = FastAPI(
    title="CampusNest API",
    description="API para plataforma de renta de alojamiento estudiantil",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================================
# CONFIGURAR CORS
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# CREAR TABLAS (si no existen)
# ============================================================================

# Base.metadata.create_all(bind=engine)  # Descomentar si no usas Alembic

# ============================================================================
# REGISTRAR ROUTERS
# ============================================================================

# Router de autenticación (login, register, etc.)
app.include_router(
    auth.router,
    prefix="/api/v1",
    tags=["Autenticación"]
)

# Router de propiedades (CRUD de propiedades)
app.include_router(
    propiedades.router,
    prefix="/api/v1",
    tags=["Propiedades"]
)

# Router de rentas y reportes
app.include_router(
    rentas.router,
    prefix="/api/v1",
    tags=["Rentas y Reportes"]
)

# Router de favoritos
app.include_router(
    favoritos.router,
    prefix="/api/v1",
    tags=["Favoritos"]
)

# Router de calificaciones
app.include_router(
    calificaciones.router,
    prefix="/api/v1",
    tags=["Calificaciones"]
)

# ============================================================================
# NUEVOS ROUTERS (Los que acabas de agregar)
# ============================================================================

# Router de upload de imágenes (Cloudinary)
app.include_router(
    upload.router,
    prefix="/api/v1",
    tags=["Upload de Imágenes"]
)

# Router de pagos (Stripe/OpenPay)
app.include_router(
    pagos.router,
    prefix="/api/v1",
    tags=["Pagos"]
)

# Router de mensajería (Chat entre usuarios)
app.include_router(
    mensajes.router,
    prefix="/api/v1",
    tags=["Mensajería"]
)

# Router de notificaciones
app.include_router(
    notificaciones.router,
    prefix="/api/v1",
    tags=["Notificaciones"]
)

# ============================================================================
# ENDPOINTS RAÍZ
# ============================================================================

@app.get("/")
async def root():
    """Endpoint raíz de la API"""
    return {
        "message": "Bienvenido a CampusNest API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check para verificar que la API está funcionando"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

# ============================================================================
# EJECUTAR APLICACIÓN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )