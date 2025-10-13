# Importar todos los modelos aquí para que SQLAlchemy los detecte
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador
from app.models.propiedad import Propiedad, CaracteristicaPropiedad, FotoPropiedad
from app.models.renta_reporte import Renta, ReporteInquilino

__all__ = [
    "Usuario", 
    "PerfilEstudiante", 
    "PerfilArrendador",
    "Propiedad",
    "CaracteristicaPropiedad", 
    "FotoPropiedad",
    "Renta", 
    "ReporteInquilino"
]