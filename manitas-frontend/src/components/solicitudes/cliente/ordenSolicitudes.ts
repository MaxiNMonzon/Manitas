// Cómo se agrupan y se ordenan las solicitudes en "Mis solicitudes" del cliente.
// Son funciones puras (reciben una lista y devuelven otra): no dibujan nada y se pueden testear solas.
import { fechaClave, grupoCliente, leTocaAlCliente, type GrupoCliente } from '../estadosCliente'
import type { SolicitudResumen } from '../../../types'

export const pestañas: { valor: GrupoCliente; label: string; vacio: string }[] = [
  { valor: 'en_curso', label: 'En curso', vacio: 'No tenés solicitudes en curso. Buscá un profesional y pedile un presupuesto.' },
  { valor: 'completadas', label: 'Completadas', vacio: 'Todavía no tenés solicitudes terminadas.' },
]

const tiempo = (fecha: string | null | undefined) => (fecha ? new Date(fecha).getTime() : 0)

export const delGrupo = (todas: SolicitudResumen[], grupo: GrupoCliente) =>
  todas.filter((s) => grupoCliente(s.estadoServicio) === grupo)

// Cuántas en curso esperan una respuesta del cliente (para el aviso de arriba)
export const cuantasEsperanRespuesta = (todas: SolicitudResumen[]) => delGrupo(todas, 'en_curso').filter(leTocaAlCliente).length

// En curso: primero lo que espera una respuesta tuya, después las urgentes y el resto por fecha (lo más próximo arriba).
// Completadas: lo más reciente arriba
export function ordenar(grupo: GrupoCliente, lista: SolicitudResumen[]): SolicitudResumen[] {
  const copia = [...lista]
  if (grupo === 'en_curso') {
    return copia.sort(
      (a, b) =>
        Number(leTocaAlCliente(b)) - Number(leTocaAlCliente(a)) ||
        Number(b.urgente) - Number(a.urgente) ||
        (tiempo(fechaClave(a)?.fecha) || Infinity) - (tiempo(fechaClave(b)?.fecha) || Infinity) ||
        tiempo(b.fechaCambioEstado) - tiempo(a.fechaCambioEstado),
    )
  }
  return copia.sort(
    (a, b) => tiempo(b.fechaFinReal ?? b.fechaCambioEstado) - tiempo(a.fechaFinReal ?? a.fechaCambioEstado),
  )
}