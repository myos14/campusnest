"""
PRUEBA DE CONEXIÓN - VERSIÓN MEJORADA
"""

from app.database import engine, get_database_url

def test_connection():
    try:
        print("🔗 Probando conexión a PostgreSQL...")
        print(f"📝 URL de BD: {get_database_url()}")
        
        # Prueba simple de conexión
        with engine.connect() as conn:
            print("✅ Conexión exitosa!")
            
            # Verificar versión
            result = conn.execute("SELECT version()")
            version = result.fetchone()[0]
            print(f"🐘 PostgreSQL: {version.split(',')[0]}")
            
            # Verificar tablas
            result = conn.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            tablas = [row[0] for row in result]
            print(f"📊 Tablas encontradas: {len(tablas)}")
            
            for tabla in tablas:
                print(f"   - {tabla}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 SOLUCIÓN RÁPIDA:")
        print("1. Cambia DATABASE_URL en .env a:")
        print('   DATABASE_URL="postgresql://postgres:myos1323@localhost:5432/campusnest"')
        print("2. O crea una nueva BD temporal:")
        print("   createdb campusnest_test")
        return False

if __name__ == "__main__":
    test_connection()