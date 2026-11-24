// Recuerda (en el navegador) cuándo cambiaste vos cada solicitud: así las novedades del Inicio
// avisan solo lo que hizo la otra persona ("Jorge confirmó tu visita") y no lo que tocaste vos
import { misAccionesStorage } from './almacenamiento'
// El back pone la hora del cambio de estado; con este margen se cubre la demora del pedido
const MARGEN_MILISEGUNDOS = 2 * 60 * 1000

export function registrarMiAccion(idSolicitud: number) {
  const acciones = misAccionesStorage.get()
  acciones[idSolicitud] = Date.now()
  misAccionesStorage.set(acciones)
}

// El último cambio de estado de la solicitud lo hiciste vos
export function laCambieYo(idSolicitud: number, fechaCambioEstado: string): boolean {
  const cuando = misAccionesStorage.get()[idSolicitud]
  return cuando != null && new Date(fechaCambioEstado).getTime() <= cuando + MARGEN_MILISEGUNDOS
}
