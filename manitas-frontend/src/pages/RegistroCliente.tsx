import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AuthLayout from '../components/AuthLayout'
import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { useListado } from '../hooks/useListado'
import { CamposContraseña, CamposDatosPersonales } from './registro/CamposDatosPersonales'
import { datosPersonalesParaEnviar, datosPersonalesVacios, validarDatosPersonales } from './registro/datosPersonales'
import type { Localidad, Provincia, RegistroClienteRequest, Zona } from '../types'

const vacio = {
  ...datosPersonalesVacios,
  idProvincia: '',
  idLocalidad: '',
  idZona: '',
  calle: '',
  altura: '',
  piso: '',
  depto: '',
}

type Campos = typeof vacio
type Errores = Partial<Record<keyof Campos, string>>

// Mismas reglas que valida el backend (CreateClienteDto), para avisar antes de enviar
function validar(c: Campos): Errores {
  const e: Errores = validarDatosPersonales(c)
  if (!c.idProvincia) e.idProvincia = 'Elegí una provincia'
  if (!c.idLocalidad) e.idLocalidad = 'Elegí una localidad'
  if (!c.idZona) e.idZona = 'Elegí una zona'
  if (!c.calle.trim()) e.calle = 'Ingresá la calle'
  if (!/^[1-9]\d*$/.test(c.altura)) e.altura = 'Solo números'
  if (c.piso.length > 10) e.piso = 'Máximo 10 caracteres'
  if (c.depto.length > 10) e.depto = 'Máximo 10 caracteres'
  return e
}

export default function RegistroCliente() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [campos, setCampos] = useState<Campos>(vacio)
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const provincias = useListado<Provincia>('/provincia')
  const localidades = useListado<Localidad>(campos.idProvincia ? `/localidad?provincia=${campos.idProvincia}` : null)
  const zonas = useListado<Zona>(campos.idLocalidad ? `/zona?localidad=${campos.idLocalidad}` : null)
  const errorCarga = provincias.error ?? localidades.error ?? zonas.error

  const errores = intentoEnviar ? validar(campos) : {}

  // Props comunes de cada campo: valor, onChange y mensaje de error
  const campo = (nombre: keyof Campos) => ({
    name: nombre,
    value: campos[nombre],
    onChange: (e: { target: { value: string } }) => {
      const valor = e.target.value
      setCampos((c) => {
        const nuevo = { ...c, [nombre]: valor }
        // Al cambiar provincia o localidad se reinician los selects que dependen de ellos
        if (nombre === 'idProvincia') Object.assign(nuevo, { idLocalidad: '', idZona: '' })
        if (nombre === 'idLocalidad') nuevo.idZona = ''
        return nuevo
      })
    },
    error: Boolean(errores[nombre]),
    helperText: errores[nombre],
    fullWidth: true,
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIntentoEnviar(true)
    setError(null)
    if (Object.keys(validar(campos)).length > 0) return

    const datos: RegistroClienteRequest = {
      ...datosPersonalesParaEnviar(campos),
      calle: campos.calle.trim(),
      altura: Number(campos.altura),
      // Piso y depto son opcionales: si están vacíos no se mandan
      piso: campos.piso.trim() || undefined,
      depto: campos.depto.trim() || undefined,
      idZonaResidencia: Number(campos.idZona),
    }

    setEnviando(true)
    try {
      await api.post('/auth/register/cliente', datos)
      // Ya registrado: inicia sesión directamente
      await login('cliente', { correo: datos.correo, contraseña: datos.contraseña })
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout volverA="/" ancho>
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
        Registrarme como cliente
      </Typography>

      {(error ?? errorCarga) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error ?? errorCarga}
        </Alert>
      )}

      <Grid container spacing={2} component="form" onSubmit={onSubmit} noValidate>
        <CamposDatosPersonales campo={campo} />

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select label="Provincia" required {...campo('idProvincia')}>
            {provincias.datos.map((p) => (
              <MenuItem key={p.idProvincia} value={String(p.idProvincia)}>
                {p.nombreProvincia}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select label="Localidad" required disabled={!campos.idProvincia} {...campo('idLocalidad')}>
            {localidades.datos.map((l) => (
              <MenuItem key={l.idLocalidad} value={String(l.idLocalidad)}>
                {l.nombreLocalidad}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select label="Zona" required disabled={!campos.idLocalidad} {...campo('idZona')}>
            {zonas.datos.map((z) => (
              <MenuItem key={z.idZona} value={String(z.idZona)}>
                {z.nombreZona}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField label="Calle" required autoComplete="address-line1" {...campo('calle')} />
        </Grid>
        <Grid size={{ xs: 4, sm: 3 }}>
          <TextField label="Altura" required slotProps={{ htmlInput: { inputMode: 'numeric' } }} {...campo('altura')} />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <TextField label="Piso" {...campo('piso')} />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <TextField label="Depto" {...campo('depto')} />
        </Grid>

        <CamposContraseña campo={campo} />

        <Grid size={12} sx={{ mt: 1 }}>
          <Button type="submit" variant="contained" size="large" fullWidth loading={enviando}>
            Registrarme
          </Button>
        </Grid>
      </Grid>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        ¿Ya tenés una cuenta?{' '}
        <Link component={RouterLink} to="/login">
          Iniciá sesión
        </Link>
      </Typography>
    </AuthLayout>
  )
}
