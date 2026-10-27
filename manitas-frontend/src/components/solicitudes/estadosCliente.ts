// Cómo ve el cliente cada estado de su solicitud y qué le toca hacer (o qué está esperando).
// Los nombres son distintos a los del profesional: el cliente habla de "Pendiente", "Confirmada"...
import dayjs from 'dayjs'
import type { EstadoSolicitud, SolicitudResumen } from '../../types'
import { formatoPesos, type ColorChip } from './estados'

export const estadosCliente: Record<EstadoSolicitud, { label: string; color: ColorChip }> = {
  solicitado: { label: 'Pendiente', color: 'warning' },
  en_coordinacion: { label: 'A coordinar', color: 'info' },
  agendado: { label: 'Confirmada', color: 'primary' },
  presupuestado: { label: 'Presupuesto recibido', color: 'secondary' },
  contratado: { label: 'En proceso', color: 'info' },
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
  switch (s.estadoServicio) {
    case 'solicitado':
      return s.urgente && !s.profesional
        ? 'Buscando un profesional cerca tuyo (hasta 1 hora)'
        : 'Esperando que el profesional confirme la visita'
    case 'en_coordinacion':
      return 'El profesional se va a comunicar para coordinar la fecha'
    case 'agendado':
      if (s.urgente && s.fechaVisita) return `Llega a las ${dayjs(s.fechaVisita).format('HH:mm')}`
      return s.costoEstimado == null
        ? 'Después de la visita te manda el presupuesto'
        : `Trabajo confirmado: ${formatoPesos(s.costoFinal)}`
    case 'presupuestado':
      return `Te mandó un presupuesto de ${formatoPesos(s.costoFinal)}: aceptalo o rechazalo`
    case 'contratado':
      return debePagar(s) ? `Trabajo en curso. Pagá ${formatoPesos(s.costoFinal)} cuando termine` : `Trabajo contratado: ${formatoPesos(s.costoFinal)}`
    case 'reprogramacion':
      return s.propuestaDe === 'profesional'
        ? 'El profesional propuso otro horario: aceptalo o rechazalo'
        : 'Esperando que el profesional responda tu cambio de horario'
    case 'finalizado':
      return s.calificacionServicio ? `Pagado: ${formatoPesos(s.costoFinal)}` : '¡Terminado! Calificá al profesional'
    case 'rechazado':
      return debePagar(s) ? `Rechazada. Queda por pagar la visita: ${formatoPesos(s.costoFinal)}` : 'Rechazada'
    case 'cancelado':
      return 'Cancelada'
    case 'expirado':
      return 'Venció sin respuesta del profesional'
  }
}
