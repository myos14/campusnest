/**
 * Servicio de Mensajería (Chat en tiempo real)
 */

import api from './api';
import type { Mensaje, MensajeCreate, Conversacion, WebSocketMessage } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1';

export const messagesService = {
  /**
   * Enviar un mensaje
   */
  async enviarMensaje(mensaje: MensajeCreate): Promise<Mensaje> {
    try {
      const { data } = await api.post<Mensaje>('/mensajes', mensaje);
      console.log('✅ Mensaje enviado');
      return data;
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      throw error;
    }
  },

  /**
   * Obtener lista de conversaciones
   */
  async obtenerConversaciones(): Promise<Conversacion[]> {
    try {
      const { data } = await api.get<Conversacion[]>('/mensajes/conversaciones');
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo conversaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener mensajes de una conversación específica
   */
  async obtenerConversacion(
    idUsuario: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Mensaje[]> {
    try {
      const { data } = await api.get<Mensaje[]>(`/mensajes/conversacion/${idUsuario}`, {
        params: { limit, offset },
      });
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo conversación:', error);
      throw error;
    }
  },

  /**
   * Marcar un mensaje como leído
   */
  async marcarComoLeido(idMensaje: number): Promise<void> {
    try {
      await api.put(`/mensajes/${idMensaje}/marcar-leido`);
    } catch (error) {
      console.error('❌ Error marcando mensaje:', error);
      throw error;
    }
  },

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(idMensaje: number): Promise<void> {
    try {
      await api.delete(`/mensajes/${idMensaje}`);
      console.log('✅ Mensaje eliminado');
    } catch (error) {
      console.error('❌ Error eliminando mensaje:', error);
      throw error;
    }
  },

  /**
   * Conectar a WebSocket para chat en tiempo real
   */
  conectarWebSocket(
    userId: string,
    onMessage: (mensaje: WebSocketMessage) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ): WebSocket {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/chat/${userId}`);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
      };

      ws.onmessage = (event) => {
        try {
          const mensaje: WebSocketMessage = JSON.parse(event.data);
          onMessage(mensaje);
        } catch (error) {
          console.error('❌ Error parseando mensaje:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log('🔴 WebSocket desconectado');
        if (onClose) onClose();
      };

      return ws;
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      throw error;
    }
  },

  /**
   * Enviar mensaje a través de WebSocket
   */
  enviarMensajeWebSocket(ws: WebSocket, mensaje: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(mensaje));
    } else {
      console.error('❌ WebSocket no está conectado');
    }
  },

  /**
   * Enviar indicador de "escribiendo..."
   */
  enviarTyping(ws: WebSocket, idDestinatario: string, escribiendo: boolean): void {
    this.enviarMensajeWebSocket(ws, {
      tipo: 'typing',
      id_destinatario: idDestinatario,
      escribiendo,
    });
  },
};