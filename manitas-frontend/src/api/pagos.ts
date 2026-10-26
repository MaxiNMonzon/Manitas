// Pagar con Mercado Pago (modo prueba / sandbox). Es la otra opción, además de la tarjeta guardada.
import { api } from './client'
import type { SolicitudResumen } from '../types'

// Paso 1: el back arma el pago con el precio de la solicitud y devuelve el link de Mercado Pago
export async function irAPagarConMercadoPago(idSolicitud: number): Promise<string> {
  const data = await api.post<{ init_point: string }>('/payments/create-preference', { idSolicitud })
  if (!data?.init_point) throw new Error('Mercado Pago no devolvió el enlace de pago')
  return data.init_point
}

// Paso 2: al volver de Mercado Pago, el back verifica el pago y marca la solicitud como pagada
export async function confirmarPagoMercadoPago(paymentId: string): Promise<SolicitudResumen> {
  const { solicitud } = await api.post<{ solicitud: SolicitudResumen }>('/payments/confirmar', { paymentId })
  return solicitud
}
