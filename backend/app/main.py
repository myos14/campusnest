"""
Punto de entrada principal de la aplicación FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import propiedades, rentas, favoritos, calificaciones

# Crear instancia de FastAPI
app = FastAPI(
    title="CampusNest API",
    description="API para plataforma de renta de cuartos para estudiantes",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc
)

# Configurar CORS para permitir requests desde frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambiar por dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta de prueba
@app.get("/")
def read_root():
    """
    Endpoint de bienvenida
    """
    return {
        "message": "Bienvenido a CampusNest API",
        "version": "1.0.0",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint para verificar que la API está funcionando
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


from app.routers import auth

# Incluir routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(propiedades.router, prefix="/api/v1", tags=["Propiedades"])
app.include_router(rentas.router, prefix="/api/v1", tags=["Rentas y Reportes"])
app.include_router(favoritos.router, prefix="/api/v1", tags=["Favoritos"])
app.include_router(calificaciones.router, prefix="/api/v1", tags=["Calificaciones"])