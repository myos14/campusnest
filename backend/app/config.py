"""
Configuración de la aplicación
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:19006",
        "http://localhost:8081",
        "https://campusnest.vercel.app",  # Tu frontend en Vercel
        "*"  # En producción, especifica dominios exactos
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global
settings = Settings()