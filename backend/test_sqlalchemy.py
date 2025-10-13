"""
PRUEBA DE SQLALCHEMY DESDE VS CODE
"""

from app.database import engine

try:
    print("🔗 Probando SQLAlchemy desde VS Code...")
    
    with engine.connect() as conn:
        # Verificar conexión
        result = conn.execute("SELECT version()")
        version = result.fetchone()[0]
        print(f"✅ PostgreSQL: {version.split(',')[0]}")
        
        # Verificar datos
        result = conn.execute("SELECT COUNT(*) FROM usuarios")
        count_usuarios = result.fetchone()[0]
        print(f"👥 Usuarios en BD: {count_usuarios}")
        
        # Verificar algunas tablas clave
        result = conn.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('usuarios', 'propiedades', 'rentas')
        """)
        tablas = [row[0] for row in result]
        print(f"📊 Tablas clave: {tablas}")
        
    print("🎉 ¡SQLALCHEMY FUNCIONA PERFECTAMENTE!")
    print("🚀 Podemos continuar con los modelos...")
    
except Exception as e:
    print(f"❌ Error: {e}")