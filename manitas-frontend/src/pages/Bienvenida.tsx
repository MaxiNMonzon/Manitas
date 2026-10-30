import { Link as RouterLink, useLocation } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EngineeringIcon from '@mui/icons-material/Engineering'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AuthLayout from '../components/AuthLayout'
import SobreManitas from '../components/bienvenida/SobreManitas'

// Pantalla de entrada: arriba, ingresar o registrarse. Al tocar la flecha (o bajar) se explica qué es Manitas
// y cómo funciona, para el que llega sin conocer la app
export default function Bienvenida() {
  // Aviso que trae del login (ej: cuenta bloqueada por intentos fallidos)
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso
  const bajar = () => document.getElementById('que-es')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <AuthLayout>
          <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
            ¡Bienvenido!
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
            Ingresá a tu cuenta o creá una nueva para empezar.
          </Typography>

          {aviso && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {aviso}
            </Alert>
          )}

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

        {/* Flechita para conocer la app */}
        <ButtonBase
          onClick={bajar}
          aria-label="Conocé Manitas"
          sx={{
            position: 'absolute',
            bottom: { xs: 12, md: 20 },
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'column',
            px: 2,
            py: 0.5,
            borderRadius: 3,
            color: 'primary.main',
            bgcolor: 'rgba(255,255,255,0.9)',
            boxShadow: 2,
            '@keyframes rebote': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(5px)' } },
            '& svg': { animation: 'rebote 1.6s ease-in-out infinite' },
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Conocé Manitas
          </Typography>
          <KeyboardArrowDownIcon />
        </ButtonBase>
      </Box>

      <SobreManitas />
    </>
  )
}
