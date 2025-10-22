/**
 * Servicio de Pagos (Stripe/OpenPay)
 */

import api from './api';
import type { Pago, PagoCreate, PagoIntencionResponse, PagoConfirmar } from '../types';

export const paymentsService = {
  /**
   * Crear intención de pago
   */
  async crearIntencionPago(pago: PagoCreate): Promise<PagoIntencionResponse> {
    try {
      const { data } = await api.post<PagoIntencionResponse>(
        '/pagos/crear-intencion',
        pago
      );
      console.log('✅ Intención de pago creada');
      return data;
    } catch (error) {
      console.error('❌ Error creando intención de pago:', error);
      throw error;
    }
  },

  /**
   * Confirmar un pago realizado
   */
  async confirmarPago(confirmacion: PagoConfirmar): Promise<void> {
    try {
      await api.post('/pagos/confirmar', confirmacion);
      console.log('✅ Pago confirmado');
    } catch (error) {
      console.error('❌ Error confirmando pago:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de pagos del usuario
   */
  async obtenerHistorial(): Promise<Pago[]> {
    try {
      const { data } = await api.get<Pago[]>('/pagos/historial');
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un pago específico
   */
  async obtenerDetallePago(idPago: number): Promise<Pago> {
    try {
      const { data } = await api.get<Pago>(`/pagos/${idPago}`);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo detalle de pago:', error);
      throw error;
    }
  },

  /**
   * Helper: Procesar pago con Stripe (Web/Mobile)
   * Nota: Requiere @stripe/stripe-react-native o @stripe/react-stripe-js
   */
  async procesarPagoStripe(
    idRenta: number,
    monto: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Crear intención de pago en backend
      const intencion = await this.crearIntencionPago({
        id_renta: idRenta,
        monto: monto,
        metodo_pago: 'stripe',
      });

      if (!intencion.client_secret) {
        throw new Error('No se obtuvo client_secret de Stripe');
      }

      // 2. TODO: Implementar confirmación con Stripe Elements
      // En React Native necesitarás usar @stripe/stripe-react-native
      // En Web necesitarás usar @stripe/react-stripe-js
      
      console.log('⚠️ Implementar confirmación de pago con Stripe Elements');
      console.log('Client Secret:', intencion.client_secret);

      // Por ahora, retornar mock
      return {
        success: false,
        error: 'Integración de Stripe pendiente. Instala @stripe/stripe-react-native',
      };
    } catch (error: any) {
      console.error('❌ Error procesando pago con Stripe:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  },

  /**
   * Helper: Procesar pago por transferencia
   */
  async procesarPagoTransferencia(
    idRenta: number,
    monto: number
  ): Promise<{ success: boolean; cuentaBancaria?: string; error?: string }> {
    try {
      const intencion = await this.crearIntencionPago({
        id_renta: idRenta,
        monto: monto,
        metodo_pago: 'transferencia',
      });

      return {
        success: true,
        cuentaBancaria: intencion.cuenta_bancaria,
      };
    } catch (error: any) {
      console.error('❌ Error procesando pago por transferencia:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  },

  /**
   * Helper: Procesar pago en efectivo
   */
  async procesarPagoEfectivo(idRenta: number, monto: number): Promise<{ success: boolean }> {
    try {
      await this.crearIntencionPago({
        id_renta: idRenta,
        monto: monto,
        metodo_pago: 'efectivo',
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error registrando pago en efectivo:', error);
      return { success: false };
    }
  },
};