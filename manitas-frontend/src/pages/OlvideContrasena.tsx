import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import AuthLayout from '../components/AuthLayout'
import { pedirLinkDeContraseña } from '../api/contrasena'

// Pantalla de "¿Olvidaste tu contraseña?": se pone el correo y llega un mail con un link para crear una nueva
export default function OlvideContrasena() {
  const [params] = useSearchParams()
  const [rol, setRol] = useState<'cliente' | 'profesional'>(params.get('rol') === 'profesional' ? 'profesional' : 'cliente')
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const correoValido = /^\S+@\S+\.\S+$/.test(correo.trim())

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const { mensaje } = await pedirLinkDeContraseña(rol, correo)
      setListo(mensaje)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo mandar el pedido')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout volverA={`/login?rol=${rol}`}>
      <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography color="text.secondary">
            Ingresá el email con el que te registraste.
          </Typography>
        </div>

        {listo ? (
          <Alert severity="success">{listo}</Alert>
        ) : (
          <>
            <ToggleButtonGroup
              exclusive
              fullWidth
              color="primary"
              size="small"
              value={rol}
              onChange={(_, valor: 'cliente' | 'profesional' | null) => valor && setRol(valor)}
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

            <Button type="submit" variant="contained" size="large" fullWidth loading={enviando} disabled={!correoValido}>
              Enviar
            </Button>
          </>
        )}
      </Stack>
    </AuthLayout>
  )
}
