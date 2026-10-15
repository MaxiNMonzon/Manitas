import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import AuthLayout from '../components/AuthLayout'
import type { Rol } from '../types'

// Provisorio: el formulario se arma en el próximo paso
// (POST /auth/register/cliente y /auth/register/profesional).
export default function Registro({ rol }: { rol: Extract<Rol, 'cliente' | 'profesional'> }) {
  return (
    <AuthLayout volverA="/">
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
        Registro de {rol}
      </Typography>
      <Alert severity="info">El formulario de registro está en construcción.</Alert>
    </AuthLayout>
  )
}
