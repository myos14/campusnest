"""
Script de verificación - CampusNest Backend
Verifica que todos los cambios estén implementados correctamente
"""

import os
import sys
from pathlib import Path

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def check_file_exists(filepath, description):
    """Verifica si un archivo existe"""
    if os.path.exists(filepath):
        print(f"{GREEN}✅{RESET} {description}")
        return True
    else:
        print(f"{RED}❌{RESET} {description}")
        return False

def check_import_in_file(filepath, import_text, description):
    """Verifica si un import existe en un archivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if import_text in content:
                print(f"{GREEN}✅{RESET} {description}")
                return True
            else:
                print(f"{RED}❌{RESET} {description}")
                return False
    except FileNotFoundError:
        print(f"{RED}❌{RESET} {description} (archivo no encontrado)")
        return False

def check_text_in_file(filepath, text, description):
    """Verifica si un texto existe en un archivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if text in content:
                print(f"{GREEN}✅{RESET} {description}")
                return True
            else:
                print(f"{RED}❌{RESET} {description}")
                return False
    except FileNotFoundError:
        print(f"{RED}❌{RESET} {description} (archivo no encontrado)")
        return False

def main():
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}🔍 VERIFICACIÓN DE IMPLEMENTACIÓN - CAMPUSNEST BACKEND{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    results = []
    
    # ========================================================================
    # 1. VERIFICAR ARCHIVOS NUEVOS
    # ========================================================================
    print(f"{YELLOW}📁 1. VERIFICANDO ARCHIVOS NUEVOS...{RESET}\n")
    
    results.append(check_file_exists(
        "app/routers/upload.py",
        "Router de upload de imágenes (upload.py)"
    ))
    
    results.append(check_file_exists(
        "app/routers/pagos.py",
        "Router de pagos (pagos.py)"
    ))
    
    results.append(check_file_exists(
        "app/routers/mensajes.py",
        "Router de mensajes (mensajes.py)"
    ))
    
    results.append(check_file_exists(
        "app/routers/notificaciones.py",
        "Router de notificaciones (notificaciones.py)"
    ))
    
    results.append(check_file_exists(
        "app/models/mensajes_notificaciones_pagos.py",
        "Modelos nuevos (mensajes_notificaciones_pagos.py)"
    ))
    
    results.append(check_file_exists(
        "app/schemas/nuevos_schemas.py",
        "Schemas nuevos (nuevos_schemas.py)"
    ))
    
    # ========================================================================
    # 2. VERIFICAR IMPORTS EN models/__init__.py
    # ========================================================================
    print(f"\n{YELLOW}📦 2. VERIFICANDO IMPORTS EN models/__init__.py...{RESET}\n")
    
    results.append(check_import_in_file(
        "app/models/__init__.py",
        "from app.models.mensajes_notificaciones_pagos import",
        "Import de modelos nuevos"
    ))
    
    results.append(check_import_in_file(
        "app/models/__init__.py",
        "Mensaje",
        "Import de modelo Mensaje"
    ))
    
    results.append(check_import_in_file(
        "app/models/__init__.py",
        "Notificacion",
        "Import de modelo Notificacion"
    ))
    
    results.append(check_import_in_file(
        "app/models/__init__.py",
        "Pago",
        "Import de modelo Pago"
    ))
    
    # ========================================================================
    # 3. VERIFICAR IMPORTS EN main.py
    # ========================================================================
    print(f"\n{YELLOW}🚀 3. VERIFICANDO IMPORTS EN main.py...{RESET}\n")
    
    results.append(check_import_in_file(
        "app/main.py",
        "upload",
        "Import del router upload"
    ))
    
    results.append(check_import_in_file(
        "app/main.py",
        "pagos",
        "Import del router pagos"
    ))
    
    results.append(check_import_in_file(
        "app/main.py",
        "mensajes",
        "Import del router mensajes"
    ))
    
    results.append(check_import_in_file(
        "app/main.py",
        "notificaciones",
        "Import del router notificaciones"
    ))
    
    # ========================================================================
    # 4. VERIFICAR REGISTRO DE ROUTERS EN main.py
    # ========================================================================
    print(f"\n{YELLOW}🔗 4. VERIFICANDO REGISTRO DE ROUTERS EN main.py...{RESET}\n")
    
    results.append(check_text_in_file(
        "app/main.py",
        "upload.router",
        "Router upload registrado"
    ))
    
    results.append(check_text_in_file(
        "app/main.py",
        "pagos.router",
        "Router pagos registrado"
    ))
    
    results.append(check_text_in_file(
        "app/main.py",
        "mensajes.router",
        "Router mensajes registrado"
    ))
    
    results.append(check_text_in_file(
        "app/main.py",
        "notificaciones.router",
        "Router notificaciones registrado"
    ))
    
    # ========================================================================
    # 5. VERIFICAR CONFIGURACIÓN DE CLOUDINARY
    # ========================================================================
    print(f"\n{YELLOW}☁️  5. VERIFICANDO CONFIGURACIÓN DE CLOUDINARY...{RESET}\n")
    
    results.append(check_text_in_file(
        "app/config.py",
        "CLOUDINARY_CLOUD_NAME",
        "Variable CLOUDINARY_CLOUD_NAME en config.py"
    ))
    
    results.append(check_text_in_file(
        "app/config.py",
        "CLOUDINARY_API_KEY",
        "Variable CLOUDINARY_API_KEY en config.py"
    ))
    
    results.append(check_text_in_file(
        "app/config.py",
        "CLOUDINARY_API_SECRET",
        "Variable CLOUDINARY_API_SECRET en config.py"
    ))
    
    results.append(check_file_exists(
        ".env",
        "Archivo .env existe"
    ))
    
    # ========================================================================
    # 6. VERIFICAR RELACIONES EN MODELOS EXISTENTES
    # ========================================================================
    print(f"\n{YELLOW}🔗 6. VERIFICANDO RELACIONES EN MODELOS...{RESET}\n")
    
    results.append(check_text_in_file(
        "app/models/renta_reporte.py",
        'relationship("Pago"',
        "Relación Renta -> Pago"
    ))
    
    results.append(check_text_in_file(
        "app/models/propiedad.py",
        'relationship("Mensaje"',
        "Relación Propiedad -> Mensaje"
    ))
    
    # ========================================================================
    # 7. VERIFICAR DEPENDENCIAS INSTALADAS
    # ========================================================================
    print(f"\n{YELLOW}📦 7. VERIFICANDO DEPENDENCIAS INSTALADAS...{RESET}\n")
    
    try:
        import cloudinary
        print(f"{GREEN}✅{RESET} cloudinary instalado (v{cloudinary.__version__})")
        results.append(True)
    except ImportError:
        print(f"{RED}❌{RESET} cloudinary NO instalado")
        results.append(False)
    
    try:
        import stripe
        print(f"{GREEN}✅{RESET} stripe instalado (v{stripe.__version__})")
        results.append(True)
    except ImportError:
        print(f"{RED}❌{RESET} stripe NO instalado")
        results.append(False)
    
    try:
        import websockets
        print(f"{GREEN}✅{RESET} websockets instalado")
        results.append(True)
    except ImportError:
        print(f"{RED}❌{RESET} websockets NO instalado")
        results.append(False)
    
    # ========================================================================
    # 8. RESUMEN
    # ========================================================================
    total = len(results)
    passed = sum(results)
    failed = total - passed
    percentage = (passed / total) * 100
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}📊 RESUMEN DE VERIFICACIÓN{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    print(f"Total de verificaciones: {total}")
    print(f"{GREEN}Pasadas: {passed}{RESET}")
    print(f"{RED}Fallidas: {failed}{RESET}")
    print(f"Porcentaje de completitud: {percentage:.1f}%\n")
    
    if percentage == 100:
        print(f"{GREEN}🎉 ¡PERFECTO! Todos los cambios están implementados correctamente.{RESET}")
        print(f"{GREEN}✅ Tu backend está listo para usar.{RESET}\n")
        print(f"{BLUE}📖 Ve a http://localhost:8000/docs para ver los endpoints{RESET}\n")
    elif percentage >= 80:
        print(f"{YELLOW}⚠️  Casi listo. Revisa los items fallidos arriba.{RESET}\n")
    else:
        print(f"{RED}❌ Faltan varios cambios por implementar.{RESET}")
        print(f"{RED}Revisa la lista de items fallidos arriba.{RESET}\n")
    
    return 0 if percentage == 100 else 1

if __name__ == "__main__":
    sys.exit(main())