from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="CampusNest API",
    description="API para plataforma de renta de cuartos para estudiantes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - DEBE IR ANTES DE LOS ROUTERS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a CampusNest API",
        "version": "1.0.0",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

from app.routers import auth, propiedades, rentas, favoritos, calificaciones

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(propiedades.router, prefix="/api/v1", tags=["Propiedades"])
app.include_router(rentas.router, prefix="/api/v1", tags=["Rentas y Reportes"])
app.include_router(favoritos.router, prefix="/api/v1", tags=["Favoritos"])
app.include_router(calificaciones.router, prefix="/api/v1", tags=["Calificaciones"])