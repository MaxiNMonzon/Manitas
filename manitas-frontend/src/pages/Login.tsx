import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'

// Un solo ingreso para clientes, profesionales y el administrador:
// con el correo, el back averigua qué cuenta es y devuelve su rol
export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [verContraseña, setVerContraseña] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await login({ correo, contraseña })
      navigate('/app')
    } catch (err) {
      // 3 intentos fallidos: la cuenta queda bloqueada un rato y se vuelve al inicio con el aviso
      if (err instanceof ApiError && err.status === 429) {
        navigate('/', { replace: true, state: { aviso: err.message } })
        return
      }
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout volverA="/">
      <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
          Iniciar sesión
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type={verContraseña ? 'text' : 'password'}
          autoComplete="current-password"
          required
          fullWidth
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={verContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setVerContraseña((v) => !v)}
                    edge="end"
                  >
                    {verContraseña ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          loading={enviando}
          disabled={!correo || !contraseña}
        >
          Continuar
        </Button>

        {/* Para clientes y profesionales (la contraseña del admin está en el .env del back) */}
        <Link component={RouterLink} to="/olvide-contrasena" variant="body2" sx={{ alignSelf: 'center' }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </Stack>

      <Stack spacing={0.5} sx={{ mt: 4, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿No tenés cuenta?
        </Typography>
        <Link component={RouterLink} to="/registro/cliente" variant="body2">
          Registrate como cliente
        </Link>
        <Link component={RouterLink} to="/registro/profesional" variant="body2">
          Registrate como profesional
        </Link>
      </Stack>

    </AuthLayout>
  )
}