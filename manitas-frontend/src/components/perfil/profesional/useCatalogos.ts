import { useListado } from '../../../hooks/useListado'
import type { Opcion } from '../../SelectorConChips'
import type { FormularioProfesional } from './formulario'
import type { Especialidad, Localidad, Provincia, TipoDeServicio, Zona } from '../../../types'

// Las listas para elegir en "Mi perfil" del profesional. Solo se piden mientras edita (form != null).
// Devuelve las opciones ya armadas para los selectores
export function useCatalogos(form: FormularioProfesional | null) {
  const editando = form !== null
  const especialidades = useListado<Especialidad>(editando ? '/especialidad' : null)
  const tiposDeServicio = useListado<TipoDeServicio>(editando ? '/tipos-de-servicio' : null)
  const provincias = useListado<Provincia>(editando ? '/provincia' : null)
  const localidades = useListado<Localidad>(form?.idProvincia ? `/localidad?provincia=${form.idProvincia}` : null)
  const zonas = useListado<Zona>(form?.idLocalidad ? `/zona?localidad=${form.idLocalidad}` : null)

  // Habilidades: solo las de las especialidades elegidas, agrupadas por especialidad
  const idsEspecialidades = new Set((form?.especialidades ?? []).map((e) => e.id))
  const opcionesHabilidades: Opcion[] = tiposDeServicio.datos
    .filter((t) => idsEspecialidades.has(t.especialidad.idEspecialidad))
    .map((t) => ({ id: t.idServicio, label: t.nombreServicio, grupo: t.especialidad.nombreEspecialidad, grupoId: t.especialidad.idEspecialidad }))
    .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.label.localeCompare(b.label))

  // Zonas de la localidad elegida, con el nombre de la localidad para no confundirlas
  const localidadElegida = localidades.datos.find((l) => String(l.idLocalidad) === form?.idLocalidad)
  const opcionesZonas: Opcion[] = zonas.datos.map((z) => ({
    id: z.idZona,
    label: localidadElegida ? `${z.nombreZona} (${localidadElegida.nombreLocalidad})` : z.nombreZona,
  }))

  return {
    provincias: provincias.datos,
    localidades: localidades.datos,
    opcionesEspecialidades: especialidades.datos.map((e): Opcion => ({ id: e.idEspecialidad, label: e.nombreEspecialidad })),
    opcionesHabilidades,
    opcionesZonas,
    error: especialidades.error ?? tiposDeServicio.error ?? provincias.error,
  }
}