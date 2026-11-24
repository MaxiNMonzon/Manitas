// Cómo ve el cliente cada estado de su solicitud y qué le toca hacer (o qué está esperando).
// Los nombres son distintos a los del profesional: el cliente habla de "Pendiente", "Confirmada"...
import dayjs from 'dayjs'
import type { EstadoSolicitud, SolicitudResumen } from '../../types'
import { formatoFecha, yaFueLaVisita, type ColorChip } from './estados'
import { formatoPesos } from '../../dinero'

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
export function leTocaAlCliente(solicitud: SolicitudResumen): boolean {
  if (solicitud.estadoServicio === 'presupuestado') return true
  if (solicitud.estadoServicio === 'reprogramacion') return solicitud.propuestaDe === 'profesional'
  return debePagar(solicitud)
}

// Trabajo ya empezado sin pagar, o la visita de un presupuesto rechazado (si el profesional la cobra)
export function debePagar(solicitud: SolicitudResumen): boolean {
  if (solicitud.fechaPago) return false
  if (solicitud.estadoServicio === 'contratado') return !!solicitud.fechaInicio && new Date(solicitud.fechaInicio) <= new Date()
  if (solicitud.estadoServicio === 'rechazado') return !!solicitud.costoFinal && !solicitud.fechaInicio
  return false
}

// Reglas del back para que el cliente cancele: en solicitado (una urgente, solo mientras nadie la tomó),
// en agendado siempre y en contratado dentro de las 6 h de aceptar el presupuesto y antes de que arranque
const HORAS_ARREPENTIMIENTO = 6
export function puedeCancelar(solicitud: SolicitudResumen): boolean {
  const estado = solicitud.estadoServicio === 'reprogramacion' ? solicitud.estadoAnterior : solicitud.estadoServicio
  if (estado === 'solicitado') return true
  if (solicitud.urgente) return false
  if (estado === 'agendado') return true
  if (estado === 'contratado') {
    const yaArranco = !!solicitud.fechaInicio && new Date(solicitud.fechaInicio) <= new Date()
    const horas = solicitud.fechaAceptacion ? (Date.now() - new Date(solicitud.fechaAceptacion).getTime()) / 3600000 : Infinity
    return !yaArranco && horas <= HORAS_ARREPENTIMIENTO
  }
  return false
}

// La fecha que le importa al cliente: la del trabajo si ya lo contrató, si no la de la visita
export function fechaClave(solicitud: SolicitudResumen): { que: 'Visita' | 'Trabajo' | 'Terminado'; fecha: string } | null {
  if (solicitud.fechaFinReal) return { que: 'Terminado', fecha: solicitud.fechaFinReal }
  if (solicitud.fechaInicio && solicitud.costoEstimado != null) return { que: 'Trabajo', fecha: solicitud.fechaInicio }
  if (solicitud.fechaVisita) return { que: 'Visita', fecha: solicitud.fechaVisita }
  return null
}

export function proximoPasoCliente(solicitud: SolicitudResumen): string {
  // Describe en qué situación está la solicitud (no le da órdenes al cliente: para eso están los botones)
  switch (solicitud.estadoServicio) {
    case 'solicitado':
      return solicitud.urgente && !solicitud.profesional ? 'Buscando un profesional cerca tuyo (hasta 1 hora)' : 'Esperando confirmación del profesional'
    case 'agendado':
      if (solicitud.urgente && solicitud.fechaVisita) return `Profesional en camino · llega a las ${dayjs(solicitud.fechaVisita).format('HH:mm')}`
      if (solicitud.costoEstimado != null) return `Trabajo confirmado · ${formatoPesos(solicitud.costoFinal)}`
      return yaFueLaVisita(solicitud) ? 'Visita en curso · presupuesto pendiente' : 'Presupuesto pendiente'
    case 'presupuestado':
      return `Presupuesto recibido: ${formatoPesos(solicitud.costoFinal)} · esperando tu respuesta`
    case 'contratado':
      if (debePagar(solicitud)) return `Trabajo en curso · ${formatoPesos(solicitud.costoFinal)} a pagar`
      return solicitud.fechaInicio ? `Trabajo agendado para el ${formatoFecha(solicitud.fechaInicio)} · ${formatoPesos(solicitud.costoFinal)}` : `Trabajo contratado · ${formatoPesos(solicitud.costoFinal)}`
    case 'reprogramacion':
      return solicitud.propuestaDe === 'profesional'
        ? 'Cambio de horario propuesto por el profesional · se cancela si no respondés en 24 h'
        : 'Cambio de horario propuesto · esperando respuesta del profesional'
    case 'finalizado':
      return solicitud.calificacionServicio ? `Trabajo finalizado · pagado ${formatoPesos(solicitud.costoFinal)}` : 'Trabajo finalizado · falta tu calificación'
    case 'rechazado':
      return debePagar(solicitud) ? `Rechazada · visita a pagar: ${formatoPesos(solicitud.costoFinal)}` : 'Rechazada'
    case 'cancelado':
      return 'Cancelada'
    case 'expirado':
      return 'Vencida sin respuesta del profesional'
  }
}
