import { useListado } from '../../../hooks/useListado'
import type { Opcion } from '../../SelectorConChips'
import type { Especialidad, Localidad, Provincia, TipoDeServicio, Zona } from '../../../types'

interface Elegido {
  // Si es false no se pide nada (ej: "Mi perfil" mientras no se edita)
  activo: boolean
  // Provincia y localidad elegidas (solo sirven para buscar zonas)
  idProvincia: string
  idLocalidad: string
  // Las especialidades elegidas: las habilidades se muestran solo de esas
  especialidades: Opcion[]
}

// Las listas para elegir los oficios, habilidades y zonas del profesional.
// Las usan el registro y "Mi perfil". Devuelve las opciones ya armadas para los selectores
export function useCatalogos({ activo, idProvincia, idLocalidad, especialidades: elegidas }: Elegido) {
  const especialidades = useListado<Especialidad>(activo ? '/especialidad' : null)
  const tiposDeServicio = useListado<TipoDeServicio>(activo ? '/tipos-de-servicio' : null)
  const provincias = useListado<Provincia>(activo ? '/provincia' : null)
  const localidades = useListado<Localidad>(activo && idProvincia ? `/localidad?provincia=${idProvincia}` : null)
  const zonas = useListado<Zona>(activo && idLocalidad ? `/zona?localidad=${idLocalidad}` : null)

  // Habilidades: solo las de las especialidades elegidas, agrupadas por especialidad
  const idsEspecialidades = new Set(elegidas.map((e) => e.id))
  const opcionesHabilidades: Opcion[] = tiposDeServicio.datos
    .filter((t) => idsEspecialidades.has(t.especialidad.idEspecialidad))
    .map((t) => ({ id: t.idServicio, label: t.nombreServicio, grupo: t.especialidad.nombreEspecialidad, grupoId: t.especialidad.idEspecialidad }))
    .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.label.localeCompare(b.label))

  // Zonas de la localidad elegida. La burbuja lleva la localidad para no confundir
  // zonas con el mismo nombre de distintas localidades
  const localidadElegida = localidades.datos.find((l) => String(l.idLocalidad) === idLocalidad)
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
    error: especialidades.error ?? tiposDeServicio.error ?? provincias.error ?? localidades.error ?? zonas.error,
  }
}
