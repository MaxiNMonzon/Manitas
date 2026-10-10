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
import SelectorConChips, { type Opcion } from '../components/SelectorConChips'
import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { useListado } from '../hooks/useListado'
import { CamposContraseña, CamposDatosPersonales } from './registro/CamposDatosPersonales'
import { datosPersonalesParaEnviar, datosPersonalesVacios, validarDatosPersonales } from './registro/datosPersonales'
import type { Especialidad, Localidad, Provincia, RegistroProfesionalRequest, TipoDeServicio, Zona } from '../types'

const MAX_DESCRIPCION = 2000

const vacio = {
  ...datosPersonalesVacios,
  // Provincia y localidad solo filtran la lista de zonas de trabajo
  idProvincia: '',
  idLocalidad: '',
  nroMatricula: '',
  cbu: '',
  descripcion: '',
}

type Campos = typeof vacio
type Errores = Partial<Record<keyof Campos | 'especialidades' | 'zonas', string>>

interface Seleccion {
  especialidades: Opcion[]
  habilidades: Opcion[]
  zonas: Opcion[]
}

// Mismas reglas que valida el backend (CreateProfesionalDto), para avisar antes de enviar
function validar(c: Campos, s: Seleccion): Errores {
  const e: Errores = validarDatosPersonales(c)
  if (c.cbu && !/^\d{22}$/.test(c.cbu)) e.cbu = 'El CBU/CVU tiene 22 números'
  if (c.descripcion.length > MAX_DESCRIPCION) e.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  if (s.especialidades.length === 0) e.especialidades = 'Elegí al menos una especialidad'
  if (s.zonas.length === 0) e.zonas = 'Elegí al menos una zona de trabajo'
  return e
}

export default function RegistroProfesional() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [campos, setCampos] = useState<Campos>(vacio)
  const [seleccion, setSeleccion] = useState<Seleccion>({ especialidades: [], habilidades: [], zonas: [] })
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const provincias = useListado<Provincia>('/provincia')
  const localidades = useListado<Localidad>(campos.idProvincia ? `/localidad?provincia=${campos.idProvincia}` : null)
  const zonas = useListado<Zona>(campos.idLocalidad ? `/zona?localidad=${campos.idLocalidad}` : null)
  const especialidades = useListado<Especialidad>('/especialidad')
  const tiposDeServicio = useListado<TipoDeServicio>('/tipos-de-servicio')
  const errorCarga =
    provincias.error ?? localidades.error ?? zonas.error ?? especialidades.error ?? tiposDeServicio.error

  // Opciones de cada selector con burbujas
  const opcionesEspecialidades: Opcion[] = especialidades.datos.map((e) => ({
    id: e.idEspecialidad,
    label: e.nombreEspecialidad,
  }))
  // Habilidades: solo las de las especialidades elegidas, agrupadas por especialidad
  const idsEspecialidadesElegidas = new Set(seleccion.especialidades.map((e) => e.id))
  const opcionesHabilidades: Opcion[] = tiposDeServicio.datos
    .filter((t) => idsEspecialidadesElegidas.has(t.especialidad.idEspecialidad))
    .map((t) => ({
      id: t.idServicio,
      label: t.nombreServicio,
      grupo: t.especialidad.nombreEspecialidad,
      grupoId: t.especialidad.idEspecialidad,
    }))
    .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.label.localeCompare(b.label))
  // Zonas: las de la localidad elegida arriba. La burbuja lleva la localidad para no confundir
  // zonas con el mismo nombre de distintas localidades
  const localidadElegida = localidades.datos.find((l) => String(l.idLocalidad) === campos.idLocalidad)
  const opcionesZonas: Opcion[] = zonas.datos.map((z) => ({
    id: z.idZona,
    label: localidadElegida ? `${z.nombreZona} (${localidadElegida.nombreLocalidad})` : z.nombreZona,
  }))

  const errores = intentoEnviar ? validar(campos, seleccion) : {}

  // Props comunes de cada campo: valor, onChange y mensaje de error
  const campo = (nombre: keyof Campos) => ({
    name: nombre,
    value: campos[nombre],
    onChange: (e: { target: { value: string } }) => {
      let valor = e.target.value
      if (nombre === 'cbu') valor = valor.replace(/\D/g, '').slice(0, 22) // solo números
      setCampos((c) => {
        const nuevo = { ...c, [nombre]: valor }
        if (nombre === 'idProvincia') nuevo.idLocalidad = ''
        return nuevo
      })
    },
    error: Boolean(errores[nombre]),
    helperText: errores[nombre],
    fullWidth: true,
  })

  const cambiarEspecialidades = (elegidas: Opcion[]) => {
    const ids = new Set(elegidas.map((e) => e.id))
    // Si se saca una especialidad, también se sacan sus habilidades
    setSeleccion((s) => ({
      ...s,
      especialidades: elegidas,
      habilidades: s.habilidades.filter((h) => h.grupoId !== undefined && ids.has(h.grupoId)),
    }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIntentoEnviar(true)
    setError(null)
    if (Object.keys(validar(campos, seleccion)).length > 0) return

    const datos: RegistroProfesionalRequest = {
      ...datosPersonalesParaEnviar(campos),
      // Los opcionales vacíos no se mandan
      nroMatricula: campos.nroMatricula.trim() || undefined,
      cbu: campos.cbu || undefined,
      descripcion: campos.descripcion.trim() || undefined,
      idsEspecialidades: seleccion.especialidades.map((o) => o.id),
      idsTiposDeServicio: seleccion.habilidades.map((o) => o.id),
      idsZonasCobertura: seleccion.zonas.map((o) => o.id),
    }

    setEnviando(true)
    try {
      await api.post('/auth/register/profesional', datos)
      // Ya registrado: inicia sesión directamente
      await login('profesional', { correo: datos.correo, contraseña: datos.contraseña })
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
        Registrarme como profesional
      </Typography>

      {(error ?? errorCarga) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error ?? errorCarga}
        </Alert>
      )}

      <Grid container spacing={2} component="form" onSubmit={onSubmit} noValidate>
        <CamposDatosPersonales campo={campo} />

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Provincia" {...campo('idProvincia')} helperText="Para buscar tus zonas de trabajo">
            {provincias.datos.map((p) => (
              <MenuItem key={p.idProvincia} value={String(p.idProvincia)}>
                {p.nombreProvincia}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Localidad" disabled={!campos.idProvincia} {...campo('idLocalidad')}>
            {localidades.datos.map((l) => (
              <MenuItem key={l.idLocalidad} value={String(l.idLocalidad)}>
                {l.nombreLocalidad}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Matrícula" {...campo('nroMatricula')} helperText="Opcional" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="CBU / CVU"
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            {...campo('cbu')}
            helperText={errores.cbu ?? `Opcional · ${campos.cbu.length}/22 números`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SelectorConChips
            label="Especialidades"
            required
            opciones={opcionesEspecialidades}
            seleccionados={seleccion.especialidades}
            onChange={cambiarEspecialidades}
            error={errores.especialidades}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SelectorConChips
            label="Habilidades"
            opciones={opcionesHabilidades}
            seleccionados={seleccion.habilidades}
            onChange={(habilidades) => setSeleccion((s) => ({ ...s, habilidades }))}
            disabled={seleccion.especialidades.length === 0}
            ayuda={seleccion.especialidades.length === 0 ? 'Primero elegí una especialidad' : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SelectorConChips
            label="Zonas de trabajo"
            required
            opciones={opcionesZonas}
            seleccionados={seleccion.zonas}
            onChange={(zonas) => setSeleccion((s) => ({ ...s, zonas }))}
            disabled={!campos.idLocalidad}
            ayuda={!campos.idLocalidad ? 'Primero elegí provincia y localidad' : undefined}
            error={errores.zonas}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Sobre mí y mi trabajo"
            multiline
            minRows={4}
            placeholder="Contá tu experiencia, qué trabajos hacés, cómo trabajás..."
            {...campo('descripcion')}
            helperText={errores.descripcion ?? `Opcional · ${campos.descripcion.length}/${MAX_DESCRIPCION}`}
          />
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
        <Link component={RouterLink} to="/login?rol=profesional">
          Iniciá sesión
        </Link>
      </Typography>
    </AuthLayout>
  )
}
