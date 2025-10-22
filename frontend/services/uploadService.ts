/**
 * Servicio de Upload de Imágenes - Cloudinary
 */

import api from './api';
import type { ImageUploadResponse, MultipleImageUploadResponse } from '../types';

export const uploadService = {
  /**
   * Subir una imagen a Cloudinary
   */
  async subirImagen(imageUri: string, fileName: string = 'image.jpg'): Promise<ImageUploadResponse> {
    try {
      // Crear FormData
      const formData = new FormData();
      
      // En React Native necesitamos este formato
      const file: any = {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      };
      
      formData.append('file', file);

      const { data } = await api.post<ImageUploadResponse>(
        '/upload/imagen',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Imagen subida exitosamente:', data.url);
      return data;
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }
  },

  /**
   * Subir múltiples imágenes a Cloudinary
   */
  async subirImagenesMultiples(
    imageUris: string[]
  ): Promise<MultipleImageUploadResponse> {
    try {
      // Crear FormData con múltiples archivos
      const formData = new FormData();
      
      imageUris.forEach((uri, index) => {
        const file: any = {
          uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        };
        formData.append('files', file);
      });

      const { data } = await api.post<MultipleImageUploadResponse>(
        '/upload/imagenes-multiples',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Imágenes subidas exitosamente:', data.total_subidas);
      return data;
    } catch (error) {
      console.error('❌ Error subiendo imágenes:', error);
      throw error;
    }
  },

  /**
   * Eliminar una imagen de Cloudinary
   */
  async eliminarImagen(publicId: string): Promise<void> {
    try {
      await api.delete(`/upload/imagen/${publicId}`);
      console.log('✅ Imagen eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      throw error;
    }
  },

  /**
   * Helper: Seleccionar imagen desde galería (usando expo-image-picker)
   */
  async seleccionarImagen(): Promise<string | null> {
    try {
      const ImagePicker = require('expo-image-picker');
      
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a las fotos');
        return null;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('❌ Error seleccionando imagen:', error);
      return null;
    }
  },

  /**
   * Helper: Tomar foto con cámara (usando expo-image-picker)
   */
  async tomarFoto(): Promise<string | null> {
    try {
      const ImagePicker = require('expo-image-picker');
      
      // Pedir permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos para usar la cámara');
        return null;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
      return null;
    }
  },
};