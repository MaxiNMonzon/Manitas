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
export const puedePresupuestar = (solicitud: SolicitudResumen) =>
  solicitud.estadoServicio === 'agendado' && solicitud.costoEstimado == null && yaFueLaVisita(solicitud)

// El cliente propuso otro horario y falta que el profesional conteste
export const esperaRespuestaDeHorario = (solicitud: SolicitudResumen) =>
  solicitud.estadoServicio === 'reprogramacion' && solicitud.propuestaDe === 'cliente'

// Las acciones del detalle, en el orden en que se muestran los botones
export function accionesDelDetalle(solicitud: SolicitudResumen): AccionDetalle[] {
  const acciones: AccionDetalle[] = []
  if (puedeReprogramar(solicitud, 'profesional')) acciones.push('reprogramar')
  if (solicitud.estadoServicio === 'solicitado') acciones.push('rechazar', 'aceptar')
  if (esperaRespuestaDeHorario(solicitud)) acciones.push('mantenerHorario', 'aceptarHorario')
  if (puedePresupuestar(solicitud)) acciones.push('presupuestar')
  // A mitad del trabajo, si cambia lo que hay que hacer (el cliente lo vuelve a aceptar)
  if (solicitud.estadoServicio === 'contratado' && !solicitud.fechaPago) acciones.push('cambiarPrecio')
  return acciones
}