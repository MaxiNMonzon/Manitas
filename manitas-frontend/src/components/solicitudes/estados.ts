// Cómo se muestra cada estado de una solicitud y qué le toca hacer al profesional
import dayjs from 'dayjs'
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

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
export const formatoPesos = (monto: number | null | undefined) => pesos.format(monto ?? 0)
export const formatoFecha = (fecha: string) => dayjs(fecha).format('ddd DD/MM · HH:mm [h]')

// Plazos del back: 48 h para responder (o hasta la hora del turno pedido, lo que llegue antes);
// una urgente, 1 h para que alguien la tome
export function tiempoQueQueda(s: SolicitudResumen): string {
  const horasPasadas = (Date.now() - new Date(s.fechaCambioEstado).getTime()) / (1000 * 60 * 60)
  if (s.urgente && s.estadoServicio === 'solicitado') {
    return `${Math.max(0, Math.floor((1 - horasPasadas) * 60))} min`
  }
  let horas = 48 - horasPasadas
  if (s.estadoServicio === 'solicitado' && s.fechaVisita) {
    horas = Math.min(horas, (new Date(s.fechaVisita).getTime() - Date.now()) / (1000 * 60 * 60))
  }
  return `${Math.max(0, Math.floor(horas))} h`
}

// La fecha que importa ahora: la del trabajo si ya hay presupuesto aceptado, si no la de la visita
export function fechaPrincipal(s: SolicitudResumen): { que: 'Visita' | 'Trabajo'; fecha: string } | null {
  if (s.costoEstimado != null && s.fechaInicio) return { que: 'Trabajo', fecha: s.fechaInicio }
  if (s.fechaVisita) return { que: 'Visita', fecha: s.fechaVisita }
  return null
}

// El presupuesto se manda después de ver el problema (el back no lo deja antes de la hora de la visita)
export const yaFueLaVisita = (s: SolicitudResumen) => !!s.fechaVisita && new Date(s.fechaVisita) <= new Date()

// Qué le toca hacer al profesional (o qué está esperando)
export function proximoPaso(s: SolicitudResumen): string {
  // Describe en qué situación está la solicitud (no le da órdenes al profesional)
  switch (s.estadoServicio) {
    case 'solicitado':
      return s.fechaVisita
        ? `Visita pedida para el ${formatoFecha(s.fechaVisita)} · quedan ${tiempoQueQueda(s)} para responder`
        : `Solicitud nueva · quedan ${tiempoQueQueda(s)} para responder`
    case 'agendado':
      // Urgente: la visita es a la hora de llegada que dio al aceptarla
      if (s.urgente && s.costoEstimado == null && s.fechaVisita) return `Urgencia aceptada · llegada a las ${dayjs(s.fechaVisita).format('HH:mm')}`
      if (s.costoEstimado != null) return `Trabajo confirmado · ${formatoPesos(s.costoFinal)}`
      if (yaFueLaVisita(s)) return 'Visita en curso · presupuesto pendiente'
      return s.fechaVisita ? `Visita confirmada para el ${formatoFecha(s.fechaVisita)}` : 'Visita confirmada'
    case 'presupuestado':
      return `Presupuesto enviado: ${formatoPesos(s.costoFinal)} · esperando respuesta del cliente`
    case 'contratado':
      if (s.fechaPago) return `Trabajo pagado · ${formatoPesos(s.costoFinal)}`
      if (s.fechaInicio && new Date(s.fechaInicio) > new Date()) return `Trabajo agendado para el ${formatoFecha(s.fechaInicio)} · ${formatoPesos(s.costoFinal)}`
      return `Trabajo en curso · ${formatoPesos(s.costoFinal)} a cobrar`
    case 'reprogramacion':
      return s.propuestaDe === 'cliente'
        ? 'Cambio de horario propuesto por el cliente · esperando tu respuesta'
        : 'Cambio de horario propuesto · esperando respuesta del cliente'
    case 'finalizado':
      return `Trabajo finalizado · cobrado ${formatoPesos(s.costoFinal)}`
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
export function puedeReprogramar(s: SolicitudResumen, quien: 'cliente' | 'profesional'): boolean {
  if (s.estadoServicio === 'reprogramacion') return s.propuestaDe !== quien
  if (s.estadoServicio === 'solicitado') return quien === 'profesional' && !s.urgente
  if (s.estadoServicio !== 'agendado' && s.estadoServicio !== 'contratado') return false
  if (s.urgente && s.estadoServicio === 'agendado') return false
  const actual = s.estadoServicio === 'contratado' ? s.fechaInicio : s.fechaVisita
  return !!actual && dayjs(actual).diff(dayjs(), 'hour', true) >= HORAS_MINIMAS_REPROGRAMAR
}