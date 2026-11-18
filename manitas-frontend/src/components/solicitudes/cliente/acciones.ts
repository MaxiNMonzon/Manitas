// Qué puede hacer el cliente con cada solicitud según su estado. Solo decide QUÉ acciones hay;
// los botones los dibuja AccionesSolicitud.tsx. Así la regla está en un solo lugar.
import { puedeReprogramar } from '../estados'
import { debePagar, puedeCancelar } from '../estadosCliente'
import type { SolicitudResumen } from '../../../types'

export type AccionCliente =
  | 'cancelar'
  | 'rechazarPresupuesto'
  | 'aceptarPresupuesto'
  | 'reprogramar'
  | 'aceptarHorario'
  | 'pagar'
  | 'calificar'

// Las acciones del detalle, en el orden en que se muestran los botones
export function accionesDelDetalle(s: SolicitudResumen): AccionCliente[] {
  const acciones: AccionCliente[] = []
  if (puedeCancelar(s)) acciones.push('cancelar')
  if (s.estadoServicio === 'presupuestado') acciones.push('rechazarPresupuesto', 'aceptarPresupuesto')
  // Proponer otro horario (o una contrapropuesta al del profesional)
  if (puedeReprogramar(s, 'cliente') && s.profesional) acciones.push('reprogramar')
  // Si el que propuso fue el profesional, el cliente no puede quedarse con el suyo: acepta, propone otro o cancela
  if (s.estadoServicio === 'reprogramacion' && s.propuestaDe === 'profesional') acciones.push('aceptarHorario')
  if (debePagar(s)) acciones.push('pagar')
  if (s.estadoServicio === 'finalizado' && s.calificacionServicio == null) acciones.push('calificar')
  return acciones
}

// Lo que se pregunta antes de una acción que no se puede deshacer
export interface Confirmacion {
  titulo: string
  texto: string
  boton: string
  ok: string
}

export function confirmacionCancelar(s: SolicitudResumen): Confirmacion {
  const nombre = s.profesional?.nombre ?? 'el profesional'
  return {
    titulo: '¿Cancelar la solicitud?',
    texto:
      s.estadoServicio === 'solicitado'
        ? 'La solicitud se cancela y se libera el horario que habías elegido.'
        : `Le avisamos a ${nombre} y se liberan los horarios reservados. No se puede deshacer.`,
    boton: 'Cancelar solicitud',
    ok: 'Solicitud cancelada.',
  }
}

export function confirmacionRechazarPresupuesto(s: SolicitudResumen): Confirmacion {
  const nombre = s.profesional?.nombre ?? 'el profesional'
  return {
    titulo: '¿Rechazar el presupuesto?',
    texto: s.costoVisita
      ? `La solicitud termina acá. Igual queda por pagar la visita de ${nombre}.`
      : 'La solicitud termina acá y no se puede deshacer.',
    boton: 'Rechazar',
    ok: 'Presupuesto rechazado.',
  }
}
