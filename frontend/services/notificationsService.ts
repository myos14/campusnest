/**
 * Servicio de Notificaciones
 */

import api from './api';
import type { Notificacion, ConfiguracionNotificaciones } from '../types';

export const notificationsService = {
  /**
   * Obtener notificaciones del usuario
   */
  async obtenerNotificaciones(
    soloNoLeidas: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notificacion[]> {
    try {
      const { data } = await api.get<Notificacion[]>('/notificaciones', {
        params: { solo_no_leidas: soloNoLeidas, limit, offset },
      });
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async contarNoLeidas(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number }>('/notificaciones/no-leidas/count');
      return data.count;
    } catch (error) {
      console.error('❌ Error contando notificaciones:', error);
      return 0;
    }
  },

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(idNotificacion: number): Promise<void> {
    try {
      await api.put(`/notificaciones/${idNotificacion}/marcar-leida`);
      console.log('✅ Notificación marcada como leída');
    } catch (error) {
      console.error('❌ Error marcando notificación:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(): Promise<void> {
    try {
      await api.put('/notificaciones/marcar-todas-leidas');
      console.log('✅ Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('❌ Error marcando notificaciones:', error);
      throw error;
    }
  },

  /**
   * Eliminar una notificación
   */
  async eliminarNotificacion(idNotificacion: number): Promise<void> {
    try {
      await api.delete(`/notificaciones/${idNotificacion}`);
      console.log('✅ Notificación eliminada');
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      throw error;
    }
  },

  /**
   * Eliminar todas las notificaciones
   */
  async eliminarTodas(): Promise<void> {
    try {
      await api.delete('/notificaciones/eliminar-todas');
      console.log('✅ Todas las notificaciones eliminadas');
    } catch (error) {
      console.error('❌ Error eliminando notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async obtenerConfiguracion(): Promise<ConfiguracionNotificaciones> {
    try {
      const { data } = await api.get<ConfiguracionNotificaciones>(
        '/notificaciones/configuracion'
      );
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuración de notificaciones
   */
  async actualizarConfiguracion(
    config: ConfiguracionNotificaciones
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const { data } = await api.put<ConfiguracionNotificaciones>(
        '/notificaciones/configuracion',
        config
      );
      console.log('✅ Configuración actualizada');
      return data;
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      throw error;
    }
  },
};