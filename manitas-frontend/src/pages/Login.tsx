import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AuthLayout from '../components/AuthLayout'
import AccesosDemo from '../components/AccesosDemo'
import { useAuth } from '../auth/useAuth'
import type { Rol } from '../types'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()

  const [rol, setRol] = useState<Rol>(params.get('rol') === 'profesional' ? 'profesional' : 'cliente')
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [verContraseña, setVerContraseña] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await login(rol, { correo, contraseña })
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout volverA="/">
      <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
        <ToggleButtonGroup
          exclusive
          fullWidth
          color="primary"
          size="small"
          value={rol}
          onChange={(_, valor: Rol | null) => valor && setRol(valor)}
        >
          <ToggleButton value="cliente">Soy cliente</ToggleButton>
          <ToggleButton value="profesional">Soy profesional</ToggleButton>
        </ToggleButtonGroup>

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

        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => setAviso('La recuperación de contraseña todavía no está disponible.')}
          sx={{ alignSelf: 'center' }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
        {aviso && (
          <Alert severity="info" onClose={() => setAviso(null)}>
            {aviso}
          </Alert>
        )}
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

      {/* PROVISORIO: accesos directos sin backend (solo en desarrollo) */}
      <AccesosDemo />
    </AuthLayout>
  )
}
