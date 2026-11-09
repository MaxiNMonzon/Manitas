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
const urgentesPrimero = (a: SolicitudResumen, b: SolicitudResumen) => Number(b.urgente) - Number(a.urgente)

// A qué carpeta va una solicitud: la de urgentes (solo en curso) o la de su estado
export const claveDe = (grupo: Grupo, s: SolicitudResumen) => (grupo === 'en_curso' && s.urgente ? URGENTES : s.estadoServicio)

export const delGrupo = (todas: SolicitudResumen[], grupo: Grupo) => todas.filter((s) => grupoDe(s.estadoServicio) === grupo)

// Orden de cada pestaña: primero las urgentes, después lo que más apura
export function ordenar(grupo: Grupo, lista: SolicitudResumen[]): SolicitudResumen[] {
  const copia = [...lista]
  if (grupo === 'nuevas') {
    // Después de las urgentes, las más viejas (son las que vencen antes)
    return copia.sort((a, b) => urgentesPrimero(a, b) || tiempo(a.fechaCambioEstado) - tiempo(b.fechaCambioEstado))
  }
  if (grupo === 'en_curso') {
    // Las urgentes; después los cambios de horario, las agendadas por fecha y al final las presupuestadas
    const prioridad = { reprogramacion: 0, agendado: 1, contratado: 2, presupuestado: 3 } as Record<string, number>
    return copia.sort(
      (a, b) =>
        urgentesPrimero(a, b) ||
        (a.urgente ? 0 : prioridad[a.estadoServicio] - prioridad[b.estadoServicio]) ||
        tiempo(fechaPrincipal(a)?.fecha) - tiempo(fechaPrincipal(b)?.fecha) ||
        tiempo(a.fechaCambioEstado) - tiempo(b.fechaCambioEstado),
    )
  }
  // Historial: agrupadas por estado y, dentro de cada uno, las urgentes y después lo más reciente
  const ordenHistorial = ['finalizado', 'rechazado', 'cancelado', 'expirado']
  return copia.sort(
    (a, b) =>
      ordenHistorial.indexOf(a.estadoServicio) - ordenHistorial.indexOf(b.estadoServicio) ||
      urgentesPrimero(a, b) ||
      tiempo(b.fechaFinReal ?? b.fechaCambioEstado) - tiempo(a.fechaFinReal ?? a.fechaCambioEstado),
  )
}

// Junta las solicitudes seguidas de la misma carpeta (la lista ya viene ordenada así)
export function enCarpetas(grupo: Grupo, lista: SolicitudResumen[]): Carpeta[] {
  const carpetas: Carpeta[] = []
  for (const s of lista) {
    const clave = claveDe(grupo, s)
    const ultima = carpetas[carpetas.length - 1]
    if (ultima?.clave === clave) ultima.items.push(s)
    else if (clave === URGENTES) carpetas.push({ clave, titulo: 'Urgentes', color: 'error', items: [s] })
    else carpetas.push({ clave, titulo: estados[s.estadoServicio].plural, color: estados[s.estadoServicio].color, items: [s] })
  }
  return carpetas
}