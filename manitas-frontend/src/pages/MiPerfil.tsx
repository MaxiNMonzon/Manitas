import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../auth/useAuth'

// Provisorio: datos de la sesión y cerrar sesión. La edición del perfil se desarrolla después.
export default function MiPerfil() {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Mi perfil
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sesión iniciada como {sesion?.rol} ({sesion?.correo}). La edición del perfil está en construcción.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={() => {
          logout()
          navigate('/')
        }}
      >
        Cerrar sesión
      </Button>
    </Paper>
  )
}
