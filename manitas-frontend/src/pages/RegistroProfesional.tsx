import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import AuthLayout from '../components/AuthLayout'

// Provisorio (POST /auth/register/profesional).
export default function RegistroProfesional() {
  return (
    <AuthLayout volverA="/">
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
        Registro de profesional
      </Typography>
      <Alert severity="info">El formulario de registro está en construcción.</Alert>
    </AuthLayout>
  )
}
