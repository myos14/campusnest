"""
Configuración de la base de datos - VERSIÓN CORREGIDA
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import urllib.parse

# Codificar la URL de la base de datos para evitar problemas de caracteres
def get_database_url():
    """Obtener y codificar correctamente la URL de la base de datos"""
    db_url = settings.DATABASE_URL
    
    # Si contiene caracteres problemáticos, usar versión codificada
    if 'postgresql+psycopg2://' in db_url:
        # Parsear y reconstruir la URL
        parsed = urllib.parse.urlparse(db_url)
        
        # Reconstruir con encoding seguro
        safe_url = urllib.parse.urlunparse((
            'postgresql',  # Cambiar a postgresql simple
            parsed.netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return safe_url
    
    return db_url

# Crear engine con configuración robusta
engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,
    echo=False,  # Desactivar echo temporalmente
    connect_args={
        "options": "-c client_encoding=utf8"
    }
)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()