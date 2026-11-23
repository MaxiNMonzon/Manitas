import { useListado } from '../../../hooks/useListado'
import type { EspecialidadResumen, Especialidad, HabilidadResumen, Localidad, Provincia, TipoDeServicio, Zona, ZonaResumen } from '../../../types'

interface Elegido {
  // Si es false no se pide nada (ej: "Mi perfil" mientras no se edita)
  activo: boolean
  // Provincia y localidad elegidas (solo sirven para buscar zonas)
  idProvincia: string
  idLocalidad: string
  // Las especialidades elegidas: las habilidades se muestran solo de esas
  especialidades: EspecialidadResumen[]
}

// Las listas para elegir los oficios, habilidades y zonas del profesional.
// Las usan el registro y "Mi perfil". Se devuelven tal como vienen del back: los selectores
// saben leerlas, así que no hace falta convertirlas
export function useCatalogos({ activo, idProvincia, idLocalidad, especialidades: elegidas }: Elegido) {
  const especialidades = useListado<Especialidad>(activo ? '/especialidad' : null)
  const tiposDeServicio = useListado<TipoDeServicio>(activo ? '/tipos-de-servicio' : null)
  const provincias = useListado<Provincia>(activo ? '/provincia' : null)
  const localidades = useListado<Localidad>(activo && idProvincia ? `/localidad?provincia=${idProvincia}` : null)
  const zonas = useListado<Zona>(activo && idLocalidad ? `/zona?localidad=${idLocalidad}` : null)

  // Habilidades: solo las de las especialidades elegidas, ordenadas por especialidad y nombre
  const idsEspecialidades = new Set(elegidas.map((e) => e.idEspecialidad))
  const opcionesHabilidades: HabilidadResumen[] = tiposDeServicio.datos
    .filter((t) => idsEspecialidades.has(t.especialidad.idEspecialidad))
    .sort((a, b) => a.especialidad.nombreEspecialidad.localeCompare(b.especialidad.nombreEspecialidad) || a.nombreServicio.localeCompare(b.nombreServicio))

  // Zonas de la localidad elegida. Se les agrega su localidad (como en el perfil) para
  // que la burbuja diga "Centro (Rosario)" y no se confundan zonas de distintas localidades
  const localidadElegida = localidades.datos.find((l) => String(l.idLocalidad) === idLocalidad)
  const opcionesZonas: ZonaResumen[] = zonas.datos.map((z) => ({ ...z, localidad: localidadElegida }))
  const opcionesEspecialidades: EspecialidadResumen[] = especialidades.datos

  return {
    provincias: provincias.datos,
    localidades: localidades.datos,
    opcionesEspecialidades,
    opcionesHabilidades,
    opcionesZonas,
    error: especialidades.error ?? tiposDeServicio.error ?? provincias.error ?? localidades.error ?? zonas.error,
  }
}
