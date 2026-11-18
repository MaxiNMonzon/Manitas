import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import SeccionTarjeta from '../../SeccionTarjeta'
import { propsCampo } from '../campos'
import { entidadDeCuenta } from '../cuentaBancaria'
import type { FormularioProfesional } from './formulario'
import type { Errores } from '../useEdicionPerfil'

interface Props {
  datos: FormularioProfesional
  errores: Errores<FormularioProfesional>
  editando: boolean
  cambiar: (cambios: Partial<FormularioProfesional>) => void
}

// "Datos para cobrar": el CBU/CVU donde se depositan los cobros. El banco sale solo de los números
export default function SeccionDatosCobro({ datos, errores, editando, cambiar }: Props) {
  const banco = entidadDeCuenta(datos.cbu)

  return (
    <SeccionTarjeta titulo="Datos para cobrar">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <TextField
            {...propsCampo({ datos, errores, editando, cambiar }, 'cbu', 'CBU / CVU', {
              soloNumeros: 22,
              ayuda: `${datos.cbu.length}/22 números. Ahí se depositan tus cobros`,
            })}
            placeholder={editando ? '' : 'Sin cargar: no vas a poder recibir los depósitos'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            label="Banco"
            value={banco ?? (datos.cbu ? 'Completá los 22 números' : '—')}
            fullWidth
            helperText={editando ? 'Se completa solo con el CBU/CVU' : undefined}
            slotProps={{ input: { readOnly: true } }}
            sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
          />
        </Grid>
      </Grid>
    </SeccionTarjeta>
  )
}
