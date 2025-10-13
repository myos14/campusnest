# CampusNest

Plataforma de renta de cuartos para estudiantes universitarios en Puebla, México.

## Estructura
campusnest/
├── backend/     # API REST con FastAPI + PostgreSQL
└── frontend/    # (En desarrollo) React Native / React Web

## Backend (FastAPI)

### Características principales:
- Sistema de autenticación JWT
- CRUD de propiedades con filtros avanzados
- Sistema de rentas e historial
- Reportes de inquilinos problemáticos
- Calificaciones bidireccionales (estudiantes <> arrendadores)
- Sistema de favoritos

### Tecnologías:
- Python 3.13
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- JWT (python-jose)

### Deployment:
- Backend: Render
- Base de datos: PostgreSQL en Render

## Instalación Local

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload