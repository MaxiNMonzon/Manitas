import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useListado } from '../../../hooks/useListado'
import SeccionTarjeta from '../../SeccionTarjeta'
import { propsCampo } from '../campos'
import type { FormularioCliente } from './formulario'
import type { Errores } from '../useEdicionPerfil'
import type { Localidad, PerfilCliente, Provincia, Zona } from '../../../types'

interface Item {
  id: number
  nombre: string
}

interface Props {
  datos: FormularioCliente
  errores: Errores<FormularioCliente>
  editando: boolean
  cambiar: (cambios: Partial<FormularioCliente>) => void
  // La zona guardada (para mostrarla mientras cargan las listas)
  zonaActual: PerfilCliente['zonaResidencia']
  // "Centro, Rosario, Santa Fe"
  ubicacion: string
}

// "Mi domicilio": calle, altura, piso, depto y la zona (provincia -> localidad -> zona).
// Las listas de ubicación solo se piden al editar
export default function SeccionDomicilio({ datos, errores, editando, cambiar, zonaActual, ubicacion }: Props) {
  const provincias = useListado<Provincia>(editando ? '/provincia' : null)
  const localidades = useListado<Localidad>(editando && datos.idProvincia ? `/localidad?provincia=${datos.idProvincia}` : null)
  const zonas = useListado<Zona>(editando && datos.idLocalidad ? `/zona?localidad=${datos.idLocalidad}` : null)
  const errorListas = provincias.error ?? localidades.error ?? zonas.error

  const estado = { datos, errores, editando, cambiar }
  const actual = {
    provincia: zonaActual?.localidad?.provincia ? { id: zonaActual.localidad.provincia.idProvincia, nombre: zonaActual.localidad.provincia.nombreProvincia } : null,
    localidad: zonaActual?.localidad ? { id: zonaActual.localidad.idLocalidad, nombre: zonaActual.localidad.nombreLocalidad } : null,
    zona: zonaActual ? { id: zonaActual.idZona, nombre: zonaActual.nombreZona } : null,
  }

  // Un desplegable de ubicación. Mientras no cargan las opciones, muestra el valor actual
  const desplegable = (
    nombre: 'idProvincia' | 'idLocalidad' | 'idZona',
    label: string,
    opciones: Item[],
    valorActual: Item | null,
    alCambiar: (valor: string) => void,
    deshabilitado = false,
  ) => {
    const lista = valorActual && !opciones.some((o) => o.id === valorActual.id) && String(valorActual.id) === datos[nombre] ? [valorActual, ...opciones] : opciones
    return (
      <TextField
        select
        fullWidth
        label={label}
        value={datos[nombre]}
        disabled={deshabilitado}
        onChange={(e) => alCambiar(e.target.value)}
        error={Boolean(errores[nombre])}
        helperText={errores[nombre]}
      >
        {lista.map((o) => (
          <MenuItem key={o.id} value={String(o.id)}>
            {o.nombre}
          </MenuItem>
        ))}
      </TextField>
    )
  }

  return (
    <SeccionTarjeta titulo="Mi domicilio">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Es donde van los profesionales. Con tu zona te mostramos los que trabajan cerca.
      </Typography>
      {editando && errorListas && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar las listas para elegir la zona: {errorListas}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField {...propsCampo(estado, 'calle', 'Calle', { max: 100 })} />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <TextField {...propsCampo(estado, 'altura', 'Altura', { soloNumeros: 6 })} />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <TextField {...propsCampo(estado, 'piso', 'Piso', { max: 10 })} placeholder={editando ? 'Opcional' : '—'} />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <TextField {...propsCampo(estado, 'depto', 'Depto', { max: 10 })} placeholder={editando ? 'Opcional' : '—'} />
        </Grid>

        {editando ? (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              {desplegable(
                'idProvincia',
                'Provincia',
                provincias.datos.map((pr) => ({ id: pr.idProvincia, nombre: pr.nombreProvincia })),
                actual.provincia,
                (v) => cambiar({ idProvincia: v, idLocalidad: '', idZona: '' }),
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              {desplegable(
                'idLocalidad',
                'Localidad',
                localidades.datos.map((l) => ({ id: l.idLocalidad, nombre: l.nombreLocalidad })),
                actual.localidad,
                (v) => cambiar({ idLocalidad: v, idZona: '' }),
                !datos.idProvincia,
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              {desplegable(
                'idZona',
                'Zona / barrio',
                zonas.datos.map((z) => ({ id: z.idZona, nombre: z.nombreZona })),
                actual.zona,
                (v) => cambiar({ idZona: v }),
                !datos.idLocalidad,
              )}
            </Grid>
            {datos.idLocalidad && zonas.datos.length === 0 && !zonas.error && (
              <Grid size={12}>
                <Alert severity="info">Esa localidad todavía no tiene zonas cargadas: elegí otra.</Alert>
              </Grid>
            )}
          </>
        ) : (
          <Grid size={12}>
            <TextField label="Zona" value={ubicacion} fullWidth slotProps={{ input: { readOnly: true } }} />
          </Grid>
        )}
      </Grid>
    </SeccionTarjeta>
  )
}
