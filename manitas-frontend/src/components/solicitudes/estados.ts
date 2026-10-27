// Cómo se muestra cada estado de una solicitud y qué le toca hacer al profesional
import dayjs from 'dayjs'
import type { ClienteDeSolicitud, EstadoSolicitud, SolicitudResumen } from '../../types'

export type ColorChip = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'

// Nombres en castellano para el usuario (los del back son técnicos)
// `plural` es para los títulos de los grupos (ej: la carpeta "Agendadas")
export const estados: Record<EstadoSolicitud, { label: string; plural: string; color: ColorChip }> = {
  solicitado: { label: 'Nueva', plural: 'Nuevas', color: 'warning' },
  en_coordinacion: { label: 'A coordinar', plural: 'A coordinar', color: 'info' },
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
    estado === 'en_coordinacion' ||
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

// Plazos del back: 48 h para responder o cargar la fecha; una urgente, 1 h para que alguien la tome
export function tiempoQueQueda(s: SolicitudResumen): string {
  const horasPasadas = (Date.now() - new Date(s.fechaCambioEstado).getTime()) / (1000 * 60 * 60)
  if (s.urgente && s.estadoServicio === 'solicitado') {
    return `${Math.max(0, Math.floor((1 - horasPasadas) * 60))} min`
  }
  return `${Math.max(0, Math.floor(48 - horasPasadas))} h`
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
  switch (s.estadoServicio) {
    case 'solicitado':
      return s.fechaVisita
        ? `Pidió la visita para el ${formatoFecha(s.fechaVisita)}. Aceptá, proponé otro horario o rechazá (quedan ${tiempoQueQueda(s)})`
        : `Respondé antes de que venza: quedan ${tiempoQueQueda(s)}`
    case 'en_coordinacion':
      return s.costoEstimado == null
        ? `Coordiná la visita y cargá la fecha (vence en ${tiempoQueQueda(s)})`
        : `Coordiná la fecha del trabajo (vence en ${tiempoQueQueda(s)})`
    case 'agendado':
      // Urgente: la visita es a la hora de llegada que dio al aceptarla
      if (s.urgente && s.costoEstimado == null && s.fechaVisita) {
        return `Urgente: llegá a las ${dayjs(s.fechaVisita).format('HH:mm')} y después mandá el presupuesto`
      }
      if (s.costoEstimado != null) return `A cobrar cuando termines: ${formatoPesos(s.costoFinal)}`
      return yaFueLaVisita(s) ? 'Ya fue la visita: mandá el presupuesto' : 'Visita confirmada. Después de verlo, mandá el presupuesto'
    case 'presupuestado':
      return `Esperando que el cliente acepte el presupuesto de ${formatoPesos(s.costoFinal)}`
    case 'contratado':
      if (s.fechaInicio && new Date(s.fechaInicio) > new Date()) return `Trabajo contratado: ${formatoPesos(s.costoFinal)}`
      return s.fechaPago ? `Pagado: ${formatoPesos(s.costoFinal)}` : `Trabajo en curso. El cliente paga ${formatoPesos(s.costoFinal)} por la app`
    case 'reprogramacion':
      return s.propuestaDe === 'cliente'
        ? 'El cliente propuso otro horario: aceptalo o rechazalo'
        : 'Esperando que el cliente responda tu cambio de horario'
    case 'finalizado':
      return `Cobrado: ${formatoPesos(s.costoFinal)}`
    case 'rechazado':
      return 'Rechazada'
    case 'cancelado':
      return 'Cancelada'
    case 'expirado':
      return 'Venció sin respuesta'
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
