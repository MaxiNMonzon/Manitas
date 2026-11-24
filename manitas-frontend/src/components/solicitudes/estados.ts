// Cómo se muestra cada estado de una solicitud y qué le toca hacer al profesional
import dayjs from 'dayjs'
import { formatoPesos } from '../../dinero'
import type { ClienteDeSolicitud, EstadoSolicitud, SolicitudResumen } from '../../types'

export type ColorChip = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'

// Nombres en castellano para el usuario (los del back son técnicos)
// `plural` es para los títulos de los grupos (ej: la carpeta "Agendadas")
export const estados: Record<EstadoSolicitud, { label: string; plural: string; color: ColorChip }> = {
  solicitado: { label: 'Nueva', plural: 'Nuevas', color: 'warning' },
  agendado: { label: 'Agendada', plural: 'Agendadas', color: 'primary' },
  presupuestado: { label: 'Presupuestada', plural: 'Presupuestadas', color: 'secondary' },
  contratado: { label: 'Contratada', plural: 'Contratadas', color: 'info' },
  reprogramacion: { label: 'A reprogramar', plural: 'A reprogramar', color: 'warning' },
  finalizado: { label: 'Finalizada', plural: 'Finalizadas', color: 'success' },
  rechazado: { label: 'Rechazada', plural: 'Rechazadas', color: 'default' },
  cancelado: { label: 'Cancelada', plural: 'Canceladas', color: 'default' },
  expirado: { label: 'Vencida', plural: 'Vencidas', color: 'default' },
}

export type Grupo = 'nuevas' | 'en_curso' | 'historial'

export function grupoDe(estado: EstadoSolicitud): Grupo {
  if (estado === 'solicitado') return 'nuevas'
  if (
    estado === 'agendado' ||
    estado === 'presupuestado' ||
    estado === 'contratado' ||
    estado === 'reprogramacion'
  ) {
    return 'en_curso'
  }
  return 'historial'
}

export const formatoFecha = (fecha: string) => dayjs(fecha).format('ddd DD/MM · HH:mm [h]')

// Plazos del back: 48 h para responder (o hasta la hora del turno pedido, lo que llegue antes);
// una urgente, 1 h para que alguien la tome
export function tiempoQueQueda(solicitud: SolicitudResumen): string {
  const horasPasadas = (Date.now() - new Date(solicitud.fechaCambioEstado).getTime()) / (1000 * 60 * 60)
  if (solicitud.urgente && solicitud.estadoServicio === 'solicitado') {
    return `${Math.max(0, Math.floor((1 - horasPasadas) * 60))} min`
  }
  let horas = 48 - horasPasadas
  if (solicitud.estadoServicio === 'solicitado' && solicitud.fechaVisita) {
    horas = Math.min(horas, (new Date(solicitud.fechaVisita).getTime() - Date.now()) / (1000 * 60 * 60))
  }
  return `${Math.max(0, Math.floor(horas))} h`
}

// La fecha que importa ahora: la del trabajo si ya hay presupuesto aceptado, si no la de la visita
export function fechaPrincipal(solicitud: SolicitudResumen): { que: 'Visita' | 'Trabajo'; fecha: string } | null {
  if (solicitud.costoEstimado != null && solicitud.fechaInicio) return { que: 'Trabajo', fecha: solicitud.fechaInicio }
  if (solicitud.fechaVisita) return { que: 'Visita', fecha: solicitud.fechaVisita }
  return null
}

// El presupuesto se manda después de ver el problema (el back no lo deja antes de la hora de la visita)
export const yaFueLaVisita = (solicitud: SolicitudResumen) => !!solicitud.fechaVisita && new Date(solicitud.fechaVisita) <= new Date()

// Qué le toca hacer al profesional (o qué está esperando)
export function proximoPaso(solicitud: SolicitudResumen): string {
  // Describe en qué situación está la solicitud (no le da órdenes al profesional)
  switch (solicitud.estadoServicio) {
    case 'solicitado':
      return solicitud.fechaVisita
        ? `Visita pedida para el ${formatoFecha(solicitud.fechaVisita)} · quedan ${tiempoQueQueda(solicitud)} para responder`
        : `Solicitud nueva · quedan ${tiempoQueQueda(solicitud)} para responder`
    case 'agendado':
      // Urgente: la visita es a la hora de llegada que dio al aceptarla
      if (solicitud.urgente && solicitud.costoEstimado == null && solicitud.fechaVisita) return `Urgencia aceptada · llegada a las ${dayjs(solicitud.fechaVisita).format('HH:mm')}`
      if (solicitud.costoEstimado != null) return `Trabajo confirmado · ${formatoPesos(solicitud.costoFinal)}`
      if (yaFueLaVisita(solicitud)) return 'Visita en curso · presupuesto pendiente'
      return solicitud.fechaVisita ? `Visita confirmada para el ${formatoFecha(solicitud.fechaVisita)}` : 'Visita confirmada'
    case 'presupuestado':
      return `Presupuesto enviado: ${formatoPesos(solicitud.costoFinal)} · esperando respuesta del cliente`
    case 'contratado':
      if (solicitud.fechaPago) return `Trabajo pagado · ${formatoPesos(solicitud.costoFinal)}`
      if (solicitud.fechaInicio && new Date(solicitud.fechaInicio) > new Date()) return `Trabajo agendado para el ${formatoFecha(solicitud.fechaInicio)} · ${formatoPesos(solicitud.costoFinal)}`
      return `Trabajo en curso · ${formatoPesos(solicitud.costoFinal)} a cobrar`
    case 'reprogramacion':
      return solicitud.propuestaDe === 'cliente'
        ? 'Cambio de horario propuesto por el cliente · esperando tu respuesta'
        : 'Cambio de horario propuesto · esperando respuesta del cliente'
    case 'finalizado':
      return `Trabajo finalizado · cobrado ${formatoPesos(solicitud.costoFinal)}`
    case 'rechazado':
      return 'Rechazada'
    case 'cancelado':
      return 'Cancelada'
    case 'expirado':
      return 'Vencida sin respuesta'
  }
}

// La dirección se muestra recién cuando el profesional aceptó (antes, solo la zona)
export function direccionDe(cliente: ClienteDeSolicitud | undefined, estado: EstadoSolicitud): string | null {
  if (!cliente) return null
  const zona = cliente.zonaResidencia?.nombreZona
  if (estado === 'solicitado' || !cliente.calle) return zona ?? null
  const partes = [`${cliente.calle} ${cliente.altura ?? ''}`.trim()]
  if (cliente.piso) partes.push(`piso ${cliente.piso}`)
  if (cliente.depto) partes.push(`depto ${cliente.depto}`)
  if (zona) partes.push(zona)
  return partes.join(', ')
}

// ¿Se puede proponer otro horario? Mismas reglas que el back (PATCH /:id/reprogramar): hasta 12 h antes
// del turno. Una nueva solo la reprograma el profesional (el cliente cancela y pide de nuevo); en una
// reprogramación, contrapropone el que tenía que contestar
const HORAS_MINIMAS_REPROGRAMAR = 12
export function puedeReprogramar(solicitud: SolicitudResumen, quien: 'cliente' | 'profesional'): boolean {
  if (solicitud.estadoServicio === 'reprogramacion') return solicitud.propuestaDe !== quien
  if (solicitud.estadoServicio === 'solicitado') return quien === 'profesional' && !solicitud.urgente
  if (solicitud.estadoServicio !== 'agendado' && solicitud.estadoServicio !== 'contratado') return false
  if (solicitud.urgente && solicitud.estadoServicio === 'agendado') return false
  const actual = solicitud.estadoServicio === 'contratado' ? solicitud.fechaInicio : solicitud.fechaVisita
  return !!actual && dayjs(actual).diff(dayjs(), 'hour', true) >= HORAS_MINIMAS_REPROGRAMAR
}
