// Qué puede hacer el profesional con cada solicitud según su estado. Solo decide QUÉ acciones hay;
// los botones los dibuja AccionesSolicitud.tsx. Así la regla está en un solo lugar.
import { puedeReprogramar, yaFueLaVisita } from '../estados'
import type { SolicitudResumen } from '../../../types'

export type AccionDetalle =
  | 'reprogramar'
  | 'rechazar'
  | 'aceptar'
  | 'mantenerHorario'
  | 'aceptarHorario'
  | 'presupuestar'
  | 'cambiarPrecio'

// El back no deja presupuestar antes de la hora de la visita
export const puedePresupuestar = (s: SolicitudResumen) =>
  s.estadoServicio === 'agendado' && s.costoEstimado == null && yaFueLaVisita(s)

// El cliente propuso otro horario y falta que el profesional conteste
export const esperaRespuestaDeHorario = (s: SolicitudResumen) =>
  s.estadoServicio === 'reprogramacion' && s.propuestaDe === 'cliente'

// Las acciones del detalle, en el orden en que se muestran los botones
export function accionesDelDetalle(s: SolicitudResumen): AccionDetalle[] {
  const acciones: AccionDetalle[] = []
  if (puedeReprogramar(s, 'profesional')) acciones.push('reprogramar')
  if (s.estadoServicio === 'solicitado') acciones.push('rechazar', 'aceptar')
  if (esperaRespuestaDeHorario(s)) acciones.push('mantenerHorario', 'aceptarHorario')
  if (puedePresupuestar(s)) acciones.push('presupuestar')
  // A mitad del trabajo, si cambia lo que hay que hacer (el cliente lo vuelve a aceptar)
  if (s.estadoServicio === 'contratado' && !s.fechaPago) acciones.push('cambiarPrecio')
  return acciones
}
