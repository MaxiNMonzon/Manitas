// Cómo ve el cliente cada estado de su solicitud y qué le toca hacer (o qué está esperando).
// Los nombres son distintos a los del profesional: el cliente habla de "Pendiente", "Confirmada"...
import dayjs from 'dayjs'
import type { EstadoSolicitud, SolicitudResumen } from '../../types'
import { formatoFecha, formatoPesos, yaFueLaVisita, type ColorChip } from './estados'

export const estadosCliente: Record<EstadoSolicitud, { label: string; color: ColorChip }> = {
  solicitado: { label: 'Pendiente', color: 'warning' },
  agendado: { label: 'Confirmada', color: 'primary' },
  presupuestado: { label: 'Presupuesto recibido', color: 'secondary' },
  contratado: { label: 'Trabajo agendado', color: 'info' },
  reprogramacion: { label: 'Cambio de horario', color: 'warning' },
  finalizado: { label: 'Finalizada', color: 'success' },
  rechazado: { label: 'Rechazada', color: 'default' },
  cancelado: { label: 'Cancelada', color: 'default' },
  expirado: { label: 'Vencida', color: 'default' },
}

// Pestañas del boceto: "En curso" y "Completadas"
export type GrupoCliente = 'en_curso' | 'completadas'

const terminadas: EstadoSolicitud[] = ['finalizado', 'rechazado', 'cancelado', 'expirado']
export const estaTerminada = (estado: EstadoSolicitud) => terminadas.includes(estado)
export const grupoCliente = (estado: EstadoSolicitud): GrupoCliente => (estaTerminada(estado) ? 'completadas' : 'en_curso')

// Lo que espera una respuesta del cliente (va primero y se resalta)
export function leTocaAlCliente(s: SolicitudResumen): boolean {
  if (s.estadoServicio === 'presupuestado') return true
  if (s.estadoServicio === 'reprogramacion') return s.propuestaDe === 'profesional'
  return debePagar(s)
}

// Trabajo ya empezado sin pagar, o la visita de un presupuesto rechazado (si el profesional la cobra)
export function debePagar(s: SolicitudResumen): boolean {
  if (s.fechaPago) return false
  if (s.estadoServicio === 'contratado') return !!s.fechaInicio && new Date(s.fechaInicio) <= new Date()
  if (s.estadoServicio === 'rechazado') return !!s.costoFinal && !s.fechaInicio
  return false
}

// Reglas del back para que el cliente cancele: en solicitado (una urgente, solo mientras nadie la tomó),
// en agendado siempre y en contratado dentro de las 6 h de aceptar el presupuesto y antes de que arranque
const HORAS_ARREPENTIMIENTO = 6
export function puedeCancelar(s: SolicitudResumen): boolean {
  const estado = s.estadoServicio === 'reprogramacion' ? s.estadoAnterior : s.estadoServicio
  if (estado === 'solicitado') return true
  if (s.urgente) return false
  if (estado === 'agendado') return true
  if (estado === 'contratado') {
    const yaArranco = !!s.fechaInicio && new Date(s.fechaInicio) <= new Date()
    const horas = s.fechaAceptacion ? (Date.now() - new Date(s.fechaAceptacion).getTime()) / 3600000 : Infinity
    return !yaArranco && horas <= HORAS_ARREPENTIMIENTO
  }
  return false
}

// La fecha que le importa al cliente: la del trabajo si ya lo contrató, si no la de la visita
export function fechaClave(s: SolicitudResumen): { que: 'Visita' | 'Trabajo' | 'Terminado'; fecha: string } | null {
  if (s.fechaFinReal) return { que: 'Terminado', fecha: s.fechaFinReal }
  if (s.fechaInicio && s.costoEstimado != null) return { que: 'Trabajo', fecha: s.fechaInicio }
  if (s.fechaVisita) return { que: 'Visita', fecha: s.fechaVisita }
  return null
}

export function proximoPasoCliente(s: SolicitudResumen): string {
  // Describe en qué situación está la solicitud (no le da órdenes al cliente: para eso están los botones)
  switch (s.estadoServicio) {
    case 'solicitado':
      return s.urgente && !s.profesional ? 'Buscando un profesional cerca tuyo (hasta 1 hora)' : 'Esperando confirmación del profesional'
    case 'agendado':
      if (s.urgente && s.fechaVisita) return `Profesional en camino · llega a las ${dayjs(s.fechaVisita).format('HH:mm')}`
      if (s.costoEstimado != null) return `Trabajo confirmado · ${formatoPesos(s.costoFinal)}`
      return yaFueLaVisita(s) ? 'Visita en curso · presupuesto pendiente' : 'Presupuesto pendiente'
    case 'presupuestado':
      return `Presupuesto recibido: ${formatoPesos(s.costoFinal)} · esperando tu respuesta`
    case 'contratado':
      if (debePagar(s)) return `Trabajo en curso · ${formatoPesos(s.costoFinal)} a pagar`
      return s.fechaInicio ? `Trabajo agendado para el ${formatoFecha(s.fechaInicio)} · ${formatoPesos(s.costoFinal)}` : `Trabajo contratado · ${formatoPesos(s.costoFinal)}`
    case 'reprogramacion':
      return s.propuestaDe === 'profesional'
        ? 'Cambio de horario propuesto por el profesional · se cancela si no respondés en 24 h'
        : 'Cambio de horario propuesto · esperando respuesta del profesional'
    case 'finalizado':
      return s.calificacionServicio ? `Trabajo finalizado · pagado ${formatoPesos(s.costoFinal)}` : 'Trabajo finalizado · falta tu calificación'
    case 'rechazado':
      return debePagar(s) ? `Rechazada · visita a pagar: ${formatoPesos(s.costoFinal)}` : 'Rechazada'
    case 'cancelado':
      return 'Cancelada'
    case 'expirado':
      return 'Vencida sin respuesta del profesional'
  }
}