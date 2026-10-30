// Recuerda (en el navegador) cuándo cambiaste vos cada solicitud: así las novedades del Inicio
// avisan solo lo que hizo la otra persona ("Jorge confirmó tu visita") y no lo que tocaste vos
const CLAVE = 'manitas.misAcciones'
// El back pone la hora del cambio de estado; con este margen se cubre la demora del pedido
const MARGEN_MS = 2 * 60 * 1000

function leer(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '{}')
  } catch {
    return {}
  }
}

export function registrarMiAccion(idSolicitud: number) {
  try {
    const acciones = leer()
    acciones[idSolicitud] = Date.now()
    localStorage.setItem(CLAVE, JSON.stringify(acciones))
  } catch {
    // Sin almacenamiento (ej: ventana privada): a lo sumo te avisa algo que hiciste vos
  }
}

// El último cambio de estado de la solicitud lo hiciste vos
export function laCambieYo(idSolicitud: number, fechaCambioEstado: string): boolean {
  const cuando = leer()[idSolicitud]
  return cuando != null && new Date(fechaCambioEstado).getTime() <= cuando + MARGEN_MS
}
