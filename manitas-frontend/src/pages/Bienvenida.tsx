import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EngineeringIcon from '@mui/icons-material/Engineering'
import AuthLayout from '../components/AuthLayout'

export default function Bienvenida() {
  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
        ¡Bienvenido!
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
        Ingresá a tu cuenta o creá una nueva para empezar.
      </Typography>

      <Button
        fullWidth
        size="large"
        variant="contained"
        startIcon={<LoginIcon />}
        component={RouterLink}
        to="/login"
      >
        Iniciar sesión
      </Button>

      <Divider sx={{ my: 4, color: 'text.secondary' }}>¿No tenés cuenta?</Divider>

      <Stack spacing={2}>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<PersonAddIcon />}
          component={RouterLink}
          to="/registro/cliente"
        >
          Registrarme como cliente
        </Button>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          color="secondary"
          startIcon={<EngineeringIcon />}
          component={RouterLink}
          to="/registro/profesional"
        >
          Registrarme como profesional
        </Button>
      </Stack>
    </AuthLayout>
  )
}
