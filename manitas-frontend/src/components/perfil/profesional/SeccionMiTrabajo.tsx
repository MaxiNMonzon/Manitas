import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import SeccionTarjeta from '../../SeccionTarjeta'
import type { Opcion } from '../../SelectorConChips'
import ChipsLectura from '../ChipsLectura'
import { ListaMatriculas } from '../EditorMatriculas'
import SelectoresDeTrabajo from './SelectoresDeTrabajo'
import { propsCampo } from '../campos'
import { MAX_DESCRIPCION } from '../reglas'
import type { FormularioProfesional } from './formulario'
import type { Errores } from '../useEdicionPerfil'
import type { PerfilProfesional } from '../../../types'

interface Props {
  datos: FormularioProfesional
  errores: Errores<FormularioProfesional>
  editando: boolean
  intentoGuardar: boolean
  cambiar: (cambios: Partial<FormularioProfesional>) => void
  onCambiarEspecialidades: (elegidas: Opcion[]) => void
  // Las opciones de las listas (solo al editar, ver useCatalogos)
  opciones: { especialidades: Opcion[]; habilidades: Opcion[]; zonas: Opcion[] }
  // Las matrículas guardadas, para verlas sin editar
  matriculasGuardadas: PerfilProfesional['matriculas']
}

// "Mi trabajo": costo de la visita, especialidades, habilidades, zonas, matrículas y "Sobre mí".
// Viendo, cada lista se muestra como burbujas; editando, con los mismos selectores que el registro
export default function SeccionMiTrabajo({ datos, errores, editando, intentoGuardar, cambiar, onCambiarEspecialidades, opciones, matriculasGuardadas }: Props) {
  const estado = { datos, errores, editando, cambiar }

  return (
    <SeccionTarjeta titulo="Mi trabajo">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...propsCampo(estado, 'costoVisita', 'Costo de la visita', {
              soloNumeros: 9,
              adelante: <InputAdornment position="start">$</InputAdornment>,
              ayuda: 'Solo se cobra si el cliente rechaza el presupuesto. Vacío = no cobrás la visita',
            })}
            placeholder={editando ? '0' : 'No cobra la visita'}
          />
        </Grid>

        {editando ? (
          <SelectoresDeTrabajo
            elegidos={datos}
            opciones={opciones}
            errores={errores}
            mostrarErroresMatriculas={intentoGuardar}
            onCambiarEspecialidades={onCambiarEspecialidades}
            onCambiar={cambiar}
            ayudaZonas={!datos.idLocalidad ? 'Para agregar, elegí provincia y localidad en Datos personales' : undefined}
          />
        ) : (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <ChipsLectura label="Especialidades" items={datos.especialidades} vacio="Sin especialidades" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ChipsLectura label="Habilidades" items={datos.habilidades} vacio="Sin habilidades cargadas" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ChipsLectura label="Zonas de trabajo" items={datos.zonas} vacio="Sin zonas" />
            </Grid>
            <Grid size={12}>
              <ListaMatriculas
                matriculas={matriculasGuardadas.map((m) => ({ numero: m.numero, descripcion: m.descripcion, especialidad: m.especialidad.nombreEspecialidad }))}
              />
            </Grid>
          </>
        )}

        <Grid size={12}>
          <TextField
            {...propsCampo(estado, 'descripcion', 'Sobre mí y mi trabajo', {
              ayuda: `Lo ven los clientes al elegirte · ${datos.descripcion.length}/${MAX_DESCRIPCION}`,
            })}
            multiline
            minRows={3}
            placeholder={editando ? 'Contá tu experiencia, qué trabajos hacés, cómo trabajás...' : 'Todavía no escribiste nada sobre vos'}
          />
        </Grid>
      </Grid>
    </SeccionTarjeta>
  )
}
