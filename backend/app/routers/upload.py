"""
Router para subir imágenes a Cloudinary
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from typing import List
import cloudinary
import cloudinary.uploader
from app.config import settings
from app.utils.dependencies import get_current_user
from app.models.usuario import Usuario

router = APIRouter()

# Configurar Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


@router.post("/upload/imagen", status_code=status.HTTP_201_CREATED)
async def upload_imagen(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Subir una imagen a Cloudinary
    
    - **file**: Archivo de imagen (JPG, PNG, WEBP, etc.)
    
    Retorna la URL de la imagen y su public_id
    """
    
    # Validar que Cloudinary esté configurado
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de upload de imágenes no configurado"
        )
    
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(allowed_types)}"
        )
    
    # Validar tamaño (máximo 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es demasiado grande. Máximo 10MB"
        )
    
    try:
        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            file_content,
            folder=f"campusnest/user_{current_user.id_usuario}",
            resource_type="image",
            transformation=[
                {"quality": "auto", "fetch_format": "auto"},
                {"width": 1920, "height": 1080, "crop": "limit"}
            ]
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir imagen: {str(e)}"
        )


@router.post("/upload/imagenes-multiples", status_code=status.HTTP_201_CREATED)
async def upload_imagenes_multiples(
    files: List[UploadFile] = File(...),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Subir múltiples imágenes a Cloudinary
    
    - **files**: Lista de archivos de imagen
    
    Retorna lista de URLs y public_ids
    """
    
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de upload de imágenes no configurado"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Máximo 10 imágenes por request"
        )
    
    uploaded_images = []
    
    for file in files:
        # Validar tipo
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        if file.content_type not in allowed_types:
            continue  # Saltar archivos inválidos
        
        # Leer y validar tamaño
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            continue  # Saltar archivos muy grandes
        
        try:
            result = cloudinary.uploader.upload(
                file_content,
                folder=f"campusnest/user_{current_user.id_usuario}",
                resource_type="image",
                transformation=[
                    {"quality": "auto", "fetch_format": "auto"},
                    {"width": 1920, "height": 1080, "crop": "limit"}
                ]
            )
            
            uploaded_images.append({
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format")
            })
            
        except Exception as e:
            # Continuar con las demás imágenes si una falla
            continue
    
    if not uploaded_images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo subir ninguna imagen"
        )
    
    return {
        "total_subidas": len(uploaded_images),
        "imagenes": uploaded_images
    }


@router.delete("/upload/imagen/{public_id:path}")
async def eliminar_imagen(
    public_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    """
    Eliminar una imagen de Cloudinary
    
    - **public_id**: ID público de la imagen en Cloudinary
    """
    
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de upload de imágenes no configurado"
        )
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        
        if result.get("result") == "ok":
            return {"message": "Imagen eliminada exitosamente"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imagen no encontrada"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar imagen: {str(e)}"
        )