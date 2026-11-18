import type { ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import dayjs from 'dayjs'
import SeccionTarjeta from '../SeccionTarjeta'
import CampoFijo from './CampoFijo'
import { propsCampo } from './campos'
import type { Errores } from './useEdicionPerfil'

// Los datos que tienen el cliente y el profesional
interface DatosPersonales {
  nombre: string
  apellido: string
  correo: string
  telefono: string
}

interface Props<F extends DatosPersonales> {
  datos: F
  errores: Errores<F>
  editando: boolean
  cambiar: (cambios: Partial<F>) => void
  dni: number
  fechaNacimiento: string
  // Para qué se usa el teléfono (cambia según quién lo lee)
  ayudaTelefono: string
  // Campos de más al final (ej: el profesional busca zonas nuevas por provincia y localidad)
  children?: ReactNode
}

// "Datos personales" de Mi perfil (cliente y profesional). DNI y fecha de nacimiento no se cambian
export default function SeccionDatosPersonales<F extends DatosPersonales>({
  datos,
  errores,
  editando,
  cambiar,
  dni,
  fechaNacimiento,
  ayudaTelefono,
  children,
}: Props<F>) {
  const estado = { datos, errores, editando, cambiar }
  const noSeCambia = editando ? 'No se puede cambiar' : undefined

  return (
    <SeccionTarjeta titulo="Datos personales">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoFijo label="DNI" valor={String(dni)} ayuda={noSeCambia} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoFijo label="Fecha de nacimiento" valor={dayjs(fechaNacimiento).format('DD/MM/YYYY')} ayuda={noSeCambia} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField {...propsCampo(estado, 'nombre', 'Nombre')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField {...propsCampo(estado, 'apellido', 'Apellido')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField {...propsCampo(estado, 'correo', 'Email', { ayuda: 'Es tu usuario para entrar: si lo cambiás, entrás con el nuevo' })} type="email" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField {...propsCampo(estado, 'telefono', 'Teléfono', { soloNumeros: 15, ayuda: ayudaTelefono })} />
        </Grid>
        {children}
      </Grid>
    </SeccionTarjeta>
  )
}
