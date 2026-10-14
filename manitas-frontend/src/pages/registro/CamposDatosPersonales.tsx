import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import type { DatosPersonales } from './datosPersonales'

// Props de un TextField controlado (valor, onChange y error), las arma cada formulario
export type PropsCampo = (nombre: keyof DatosPersonales) => {
  name: string
  value: string
  onChange: (e: { target: { value: string } }) => void
  error: boolean
  helperText?: string
  fullWidth: boolean
}

// DNI, fecha de nacimiento, nombre, apellido, email y teléfono
export function CamposDatosPersonales({ campo }: { campo: PropsCampo }) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="DNI" required slotProps={{ htmlInput: { inputMode: 'numeric' } }} {...campo('dni')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Fecha de nacimiento"
          type="date"
          required
          slotProps={{ inputLabel: { shrink: true } }}
          {...campo('fechaNacimiento')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Nombre" required autoComplete="given-name" {...campo('nombre')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Apellido" required autoComplete="family-name" {...campo('apellido')} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Email" type="email" required autoComplete="email" {...campo('correo')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Teléfono" type="tel" required autoComplete="tel" placeholder="3411234567" {...campo('telefono')} />
      </Grid>
    </>
  )
}

// Contraseña y confirmación
export function CamposContraseña({ campo }: { campo: PropsCampo }) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Contraseña" type="password" required autoComplete="new-password" {...campo('contraseña')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Confirmar contraseña"
          type="password"
          required
          autoComplete="new-password"
          {...campo('confirmarContraseña')}
        />
      </Grid>
    </>
  )
}
