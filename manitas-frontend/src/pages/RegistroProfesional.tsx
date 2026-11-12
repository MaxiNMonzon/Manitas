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
import type { Opcion } from '../components/SelectorConChips'
import SelectoresDeTrabajo from '../components/perfil/profesional/SelectoresDeTrabajo'
import { useCatalogos } from '../components/perfil/profesional/useCatalogos'
import { matriculasParaEnviar, type MatriculaForm } from '../components/perfil/matriculas'
import { conEspecialidades, MAX_DESCRIPCION, validarTrabajo } from '../components/perfil/reglas'
import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { CamposContraseña, CamposDatosPersonales } from './registro/CamposDatosPersonales'
import { datosPersonalesParaEnviar, datosPersonalesVacios, validarDatosPersonales } from './registro/datosPersonales'
import type { RegistroProfesionalRequest } from '../types'

const vacio = {
  ...datosPersonalesVacios,
  // Provincia y localidad solo filtran la lista de zonas de trabajo
  idProvincia: '',
  idLocalidad: '',
  cbu: '',
  descripcion: '',
}

type Campos = typeof vacio

interface Seleccion {
  especialidades: Opcion[]
  habilidades: Opcion[]
  zonas: Opcion[]
  matriculas: MatriculaForm[]
}

// Mismas reglas que valida el backend (CreateProfesionalDto), para avisar antes de enviar.
// Lo del trabajo se valida igual que en "Mi perfil" (reglas.ts)
const validar = (c: Campos, s: Seleccion) => ({ ...validarDatosPersonales(c), ...validarTrabajo({ ...c, ...s }) })

export default function RegistroProfesional() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [campos, setCampos] = useState<Campos>(vacio)
  const [seleccion, setSeleccion] = useState<Seleccion>({ especialidades: [], habilidades: [], zonas: [], matriculas: [] })
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Las mismas listas que "Mi perfil" (oficios, habilidades de esos oficios y zonas de la localidad elegida)
  const catalogos = useCatalogos({ activo: true, idProvincia: campos.idProvincia, idLocalidad: campos.idLocalidad, especialidades: seleccion.especialidades })

  const errores: Partial<Record<string, string>> = intentoEnviar ? validar(campos, seleccion) : {}

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIntentoEnviar(true)
    setError(null)
    if (Object.keys(validar(campos, seleccion)).length > 0) return

    const datos: RegistroProfesionalRequest = {
      ...datosPersonalesParaEnviar(campos),
      // Los opcionales vacíos no se mandan
      matriculas: seleccion.matriculas.length ? matriculasParaEnviar(seleccion.matriculas) : undefined,
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

      {(error ?? catalogos.error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error ?? catalogos.error}
        </Alert>
      )}

      <Grid container spacing={2} component="form" onSubmit={onSubmit} noValidate>
        <CamposDatosPersonales campo={campo} />

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Provincia" {...campo('idProvincia')} helperText="Para buscar tus zonas de trabajo">
            {catalogos.provincias.map((p) => (
              <MenuItem key={p.idProvincia} value={String(p.idProvincia)}>
                {p.nombreProvincia}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Localidad" disabled={!campos.idProvincia} {...campo('idLocalidad')}>
            {catalogos.localidades.map((l) => (
              <MenuItem key={l.idLocalidad} value={String(l.idLocalidad)}>
                {l.nombreLocalidad}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={12}>
          <TextField
            label="CBU / CVU"
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            {...campo('cbu')}
            helperText={errores.cbu ?? `Opcional · ${campos.cbu.length}/22 números`}
          />
        </Grid>

        <SelectoresDeTrabajo
          elegidos={seleccion}
          opciones={{ especialidades: catalogos.opcionesEspecialidades, habilidades: catalogos.opcionesHabilidades, zonas: catalogos.opcionesZonas }}
          errores={errores}
          mostrarErroresMatriculas={intentoEnviar}
          onCambiarEspecialidades={(elegidas) => setSeleccion((s) => conEspecialidades(s, elegidas))}
          onCambiar={(cambios) => setSeleccion((s) => ({ ...s, ...cambios }))}
          zonasDeshabilitadas={!campos.idLocalidad}
          ayudaZonas={!campos.idLocalidad ? 'Primero elegí provincia y localidad' : undefined}
        />

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