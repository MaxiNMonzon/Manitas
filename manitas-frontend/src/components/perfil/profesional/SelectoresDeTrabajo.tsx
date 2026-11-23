import Grid from '@mui/material/Grid'
import SelectorConChips from '../../SelectorConChips'
import EditorMatriculas from '../EditorMatriculas'
import { erroresMatriculas, type MatriculaForm } from '../matriculas'
import type { EspecialidadResumen, HabilidadResumen, ZonaResumen } from '../../../types'

// Lo elegido, con la misma forma con la que viene en el perfil del back
export interface Elegidos {
  especialidades: EspecialidadResumen[]
  habilidades: HabilidadResumen[]
  zonas: ZonaResumen[]
  matriculas: MatriculaForm[]
}

// "Centro (Rosario)": la localidad evita confundir zonas con el mismo nombre
export const textoZona = (z: ZonaResumen) => (z.localidad ? `${z.nombreZona} (${z.localidad.nombreLocalidad})` : z.nombreZona)

interface Props {
  elegidos: Elegidos
  // Las opciones de cada lista (ver useCatalogos)
  opciones: { especialidades: EspecialidadResumen[]; habilidades: HabilidadResumen[]; zonas: ZonaResumen[] }
  errores: { especialidades?: string; zonas?: string }
  // Los errores de las matrículas se muestran recién después del primer intento
  mostrarErroresMatriculas: boolean
  onCambiarEspecialidades: (elegidas: EspecialidadResumen[]) => void
  onCambiar: (cambios: Partial<Elegidos>) => void
  // Las zonas salen de la localidad elegida: qué decir si todavía no eligió una
  ayudaZonas?: string
  zonasDeshabilitadas?: boolean
}

// Elegir especialidades, habilidades, zonas de trabajo y matrículas.
// Es igual en el registro del profesional y en "Mi perfil" (al editar)
export default function SelectoresDeTrabajo({
  elegidos,
  opciones,
  errores,
  mostrarErroresMatriculas,
  onCambiarEspecialidades,
  onCambiar,
  ayudaZonas,
  zonasDeshabilitadas = false,
}: Props) {
  const sinEspecialidad = elegidos.especialidades.length === 0

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <SelectorConChips
          label="Especialidades"
          required
          opciones={opciones.especialidades}
          seleccionados={elegidos.especialidades}
          onChange={onCambiarEspecialidades}
          idDe={(e) => e.idEspecialidad}
          textoDe={(e) => e.nombreEspecialidad}
          error={errores.especialidades}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SelectorConChips
          label="Habilidades"
          opciones={opciones.habilidades}
          seleccionados={elegidos.habilidades}
          onChange={(habilidades) => onCambiar({ habilidades })}
          idDe={(h) => h.idServicio}
          textoDe={(h) => h.nombreServicio}
          grupoDe={(h) => h.especialidad?.nombreEspecialidad}
          disabled={sinEspecialidad}
          ayuda={sinEspecialidad ? 'Primero elegí una especialidad' : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SelectorConChips
          label="Zonas de trabajo"
          required
          opciones={opciones.zonas}
          seleccionados={elegidos.zonas}
          onChange={(zonas) => onCambiar({ zonas })}
          idDe={(z) => z.idZona}
          textoDe={textoZona}
          disabled={zonasDeshabilitadas}
          ayuda={ayudaZonas}
          error={errores.zonas}
        />
      </Grid>

      <Grid size={12}>
        <EditorMatriculas
          especialidades={elegidos.especialidades}
          matriculas={elegidos.matriculas}
          onChange={(matriculas) => onCambiar({ matriculas })}
          errores={mostrarErroresMatriculas ? erroresMatriculas(elegidos.matriculas) : undefined}
        />
      </Grid>
    </>
  )
}