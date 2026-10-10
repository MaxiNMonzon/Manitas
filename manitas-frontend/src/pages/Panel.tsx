import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useAuth } from '../auth/useAuth'

// Provisorio: pantalla a la que se llega después de iniciar sesión.
export default function Panel() {
  const { sesion } = useAuth()

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ¡Hola!
      </Typography>
      <Typography color="text.secondary">
        Iniciaste sesión como {sesion?.rol} ({sesion?.correo}).
      </Typography>
    </Paper>
  )
}
