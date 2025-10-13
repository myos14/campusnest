"""
Script para crear las tablas en la base de datos
"""

from app.database import engine, Base
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador

print("Creando tablas...")
Base.metadata.create_all(bind=engine)
print("¡Tablas creadas exitosamente!")