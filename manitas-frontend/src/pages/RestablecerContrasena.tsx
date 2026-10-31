import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AuthLayout from '../components/AuthLayout'
import { restablecerContraseña } from '../api/contrasena'

// Se llega desde el link del mail (/restablecer-contrasena?codigo=...): se elige la contraseña nueva
export default function RestablecerContrasena() {
  const [params] = useSearchParams()
  const codigo = params.get('codigo') ?? ''
  const [contraseña, setContraseña] = useState('')
  const [repetida, setRepetida] = useState('')
  const [ver, setVer] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rolListo, setRolListo] = useState<string | null>(null)

  const muyCorta = contraseña.length > 0 && contraseña.length < 8
  const noCoinciden = repetida.length > 0 && repetida !== contraseña

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const { rol } = await restablecerContraseña(codigo, contraseña)
      setRolListo(rol)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setEnviando(false)
    }
  }

  const ojito = {
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVer((v) => !v)} edge="end">
            {ver ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }

  return (
    <AuthLayout volverA="/login">
      <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Crear contraseña nueva
        </Typography>

        {rolListo ? (
          <>
            <Alert severity="success">Listo, ya podés entrar con tu contraseña nueva.</Alert>
            <Button component={RouterLink} to={`/login?rol=${rolListo}`} variant="contained" size="large" fullWidth>
              Iniciar sesión
            </Button>
          </>
        ) : !codigo ? (
          <Alert severity="error">
            El link está incompleto. Volvé a pedirlo desde <RouterLink to="/olvide-contrasena">¿Olvidaste tu contraseña?</RouterLink>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error">
                {error}. <RouterLink to="/olvide-contrasena">Pedir otro link</RouterLink>
              </Alert>
            )}
            <TextField
              label="Contraseña nueva"
              type={ver ? 'text' : 'password'}
              autoComplete="new-password"
              required
              fullWidth
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              error={muyCorta}
              helperText={muyCorta ? 'Tiene que tener al menos 8 caracteres' : 'Mínimo 8 caracteres'}
              slotProps={ojito}
            />
            <TextField
              label="Repetí la contraseña"
              type={ver ? 'text' : 'password'}
              autoComplete="new-password"
              required
              fullWidth
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              error={noCoinciden}
              helperText={noCoinciden ? 'No coinciden' : ' '}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={enviando}
              disabled={contraseña.length < 8 || repetida !== contraseña}
            >
              Guardar contraseña
            </Button>
          </>
        )}
      </Stack>
    </AuthLayout>
  )
}