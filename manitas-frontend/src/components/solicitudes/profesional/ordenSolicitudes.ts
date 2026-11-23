// Cómo se ordenan y se agrupan las solicitudes en "Mis solicitudes" del profesional.
// Son funciones puras (reciben una lista y devuelven otra): no dibujan nada y se pueden testear solas.
import { estados, fechaPrincipal, grupoDe, type ColorChip, type Grupo } from '../estados'
import type { SolicitudResumen } from '../../../types'

export const pestañas: { valor: Grupo; label: string; vacio: string }[] = [
  { valor: 'nuevas', label: 'Nuevas', vacio: 'No tenés solicitudes nuevas para responder.' },
  { valor: 'en_curso', label: 'En curso', vacio: 'No tenés trabajos en curso.' },
  { valor: 'historial', label: 'Historial', vacio: 'Todavía no tenés solicitudes terminadas.' },
]

// En curso, las urgentes van todas juntas en su propia carpeta, arriba de todo
export const URGENTES = 'urgentes'

export interface Carpeta {
  clave: string
  titulo: string
  color: ColorChip
  items: SolicitudResumen[]
}

const tiempo = (fecha: string | null | undefined) => (fecha ? new Date(fecha).getTime() : 0)
const urgentesPrimero = (primera: SolicitudResumen, segunda: SolicitudResumen) => Number(segunda.urgente) - Number(primera.urgente)

// A qué carpeta va una solicitud: la de urgentes (solo en curso) o la de su estado
export const claveDe = (grupo: Grupo, solicitud: SolicitudResumen) => (grupo === 'en_curso' && solicitud.urgente ? URGENTES : solicitud.estadoServicio)

export const delGrupo = (todas: SolicitudResumen[], grupo: Grupo) => todas.filter((solicitud) => grupoDe(solicitud.estadoServicio) === grupo)

// Orden de cada pestaña: primero las urgentes, después lo que más apura
export function ordenar(grupo: Grupo, lista: SolicitudResumen[]): SolicitudResumen[] {
  const copia = [...lista]
  if (grupo === 'nuevas') {
    // Después de las urgentes, las más viejas (son las que vencen antes)
    return copia.sort((primera, segunda) => urgentesPrimero(primera, segunda) || tiempo(primera.fechaCambioEstado) - tiempo(segunda.fechaCambioEstado))
  }
  if (grupo === 'en_curso') {
    // Las urgentes; después los cambios de horario, las agendadas por fecha y al final las presupuestadas
    const prioridad = { reprogramacion: 0, agendado: 1, contratado: 2, presupuestado: 3 } as Record<string, number>
    return copia.sort(
      (primera, segunda) =>
        urgentesPrimero(primera, segunda) ||
        (primera.urgente ? 0 : prioridad[primera.estadoServicio] - prioridad[segunda.estadoServicio]) ||
        tiempo(fechaPrincipal(primera)?.fecha) - tiempo(fechaPrincipal(segunda)?.fecha) ||
        tiempo(primera.fechaCambioEstado) - tiempo(segunda.fechaCambioEstado),
    )
  }
  // Historial: agrupadas por estado y, dentro de cada uno, las urgentes y después lo más reciente
  const ordenHistorial = ['finalizado', 'rechazado', 'cancelado', 'expirado']
  return copia.sort(
    (primera, segunda) =>
      ordenHistorial.indexOf(primera.estadoServicio) - ordenHistorial.indexOf(segunda.estadoServicio) ||
      urgentesPrimero(primera, segunda) ||
      tiempo(segunda.fechaFinReal ?? segunda.fechaCambioEstado) - tiempo(primera.fechaFinReal ?? primera.fechaCambioEstado),
  )
}

// Junta las solicitudes seguidas de la misma carpeta (la lista ya viene ordenada así)
export function enCarpetas(grupo: Grupo, lista: SolicitudResumen[]): Carpeta[] {
  const carpetas: Carpeta[] = []
  for (const solicitud of lista) {
    const clave = claveDe(grupo, solicitud)
    const ultima = carpetas[carpetas.length - 1]
    if (ultima?.clave === clave) ultima.items.push(solicitud)
    else if (clave === URGENTES) carpetas.push({ clave, titulo: 'Urgentes', color: 'error', items: [solicitud] })
    else carpetas.push({ clave, titulo: estados[solicitud.estadoServicio].plural, color: estados[solicitud.estadoServicio].color, items: [solicitud] })
  }
  return carpetas
}