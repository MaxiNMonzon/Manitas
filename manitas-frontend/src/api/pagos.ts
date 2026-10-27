// Pagar con Mercado Pago (Checkout Pro en modo prueba / sandbox). Es la otra opción, además de la tarjeta guardada.
// Siempre pasa por Mercado Pago: con la sesión demo (sin back) no se puede pagar.
import { api } from './client'
import type { SolicitudResumen } from '../types'

// Paso 1: el back arma el pago con el precio de la solicitud y devuelve el link de Mercado Pago
export async function irAPagarConMercadoPago(idSolicitud: number): Promise<string> {
  const data = await api.post<{ init_point: string }>('/payments/create-preference', { idSolicitud })
  if (!data?.init_point) throw new Error('Mercado Pago no devolvió el enlace de pago')
  return data.init_point
}

// Paso 2: al volver de Mercado Pago ("Volver al sitio"), el back le pregunta a Mercado Pago
// si el pago se aprobó y recién ahí marca la solicitud como pagada
export async function confirmarPagoMercadoPago(paymentId: string): Promise<SolicitudResumen> {
  const { solicitud } = await api.post<{ solicitud: SolicitudResumen }>('/payments/confirmar', { paymentId })
  return solicitud
}