"""
DEBUG DE CONEXIÓN SQLALCHEMY - CORREGIDO
"""

from sqlalchemy import text
from app.database import engine
from app.config import settings

print("🔍 Debug de conexión...")
print(f"📝 DATABASE_URL: {settings.DATABASE_URL}")

try:
    # Probar conexión básica CON text()
    with engine.connect() as conn:
        print("✅ Conexión establecida")
        
        # Probar consulta simple CON text()
        result = conn.execute(text("SELECT 1 as test"))
        print(f"✅ Consulta básica: {result.fetchone()[0]}")
        
        # Probar versión de PostgreSQL
        result = conn.execute(text("SELECT version()"))
        print(f"✅ PostgreSQL: {result.fetchone()[0].split(',')[0]}")
        
        # Probar contar usuarios
        result = conn.execute(text("SELECT COUNT(*) FROM usuarios"))
        print(f"👥 Usuarios en BD: {result.fetchone()[0]}")
        
        # Probar tablas
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tablas = [row[0] for row in result]
        print(f"📊 Tablas encontradas: {len(tablas)}")
        
    print("🎉 ¡SQLALCHEMY FUNCIONA CORRECTAMENTE!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"🔧 Tipo de error: {type(e).__name__}")