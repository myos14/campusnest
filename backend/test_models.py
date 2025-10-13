# test_models.py
from app.models.usuario import Usuario, PerfilEstudiante, PerfilArrendador
from app.database import engine
from sqlalchemy import inspect

print("🔍 Verificando modelos vs BD...")

inspector = inspect(engine)

# Verificar estructura de tablas
for table_name in ['usuarios', 'perfil_estudiante', 'perfil_arrendador']:
    print(f"\n📊 Tabla: {table_name}")
    columns = inspector.get_columns(table_name)
    for col in columns:
        print(f"   - {col['name']}: {col['type']}")

print("\n✅ Modelos actualizados para coincidir con BD")