import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../auth/useAuth'

// "Mi cuenta" del administrador: sus datos están en el .env del back (ADMIN_CORREO / ADMIN_CONTRASENA)
export default function CuentaAdmin() {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Mi cuenta
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sesión de administrador: {sesion?.correo}. El correo y la contraseña se configuran en el servidor.
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