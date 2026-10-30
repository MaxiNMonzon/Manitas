import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyIcon from '@mui/icons-material/Key'
import PlaceIcon from '@mui/icons-material/Place'
import dayjs from 'dayjs'
import { useAuth } from '../../auth/useAuth'
import { tokenStorage } from '../../api/client'
import { guardarPerfilCliente, traerPerfilCliente } from '../../api/perfil'
import { useCarga } from '../../hooks/useCarga'
import { useListado } from '../../hooks/useListado'
import AvatarPersona from '../../components/AvatarPersona'
import SeccionTarjeta from '../../components/SeccionTarjeta'
import CambiarContrasenaDialog from '../../components/perfil/CambiarContrasenaDialog'
import BajaCuentaButton from '../../components/perfil/BajaCuentaButton'
import type { CambiosPerfilCliente, Localidad, PerfilCliente, Provincia, Zona } from '../../types'

// Lo que se puede editar, como texto (igual que en los campos)
interface Formulario {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  calle: string
  altura: string
  piso: string
  depto: string
  idProvincia: string
  idLocalidad: string
  idZona: string
}
type Errores = Partial<Record<keyof Formulario, string>>

function desdePerfil(p: PerfilCliente): Formulario {
  const zona = p.zonaResidencia
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    correo: p.correo,
    telefono: p.telefono,
    calle: p.calle,
    altura: String(p.altura),
    piso: p.piso ?? '',
    depto: p.depto ?? '',
    idProvincia: zona?.localidad?.provincia ? String(zona.localidad.provincia.idProvincia) : '',
    idLocalidad: zona?.localidad ? String(zona.localidad.idLocalidad) : '',
    idZona: zona ? String(zona.idZona) : '',
  }
}

// Mismas reglas que el registro (CreateClienteDto)
function validar(f: Formulario): Errores {
  const e: Errores = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(f.telefono)) e.telefono = 'Ingresá solo números, con característica'
  if (!f.calle.trim()) e.calle = 'Ingresá la calle'
  if (!(Number(f.altura) > 0)) e.altura = 'Ingresá la altura'
  if (f.piso.length > 10) e.piso = 'Máximo 10 caracteres'
  if (f.depto.length > 10) e.depto = 'Máximo 10 caracteres'
  if (!f.idZona) e.idZona = 'Elegí tu zona'
  return e
}

// Pestaña "Mi perfil" del cliente: se ve todo y con "Editar perfil" se puede cambiar.
// La dirección es importante: es donde van los profesionales, y la zona define a quiénes ve cerca
export default function PerfilCliente() {
  const navigate = useNavigate()
  const { sesion, logout, actualizarCorreo } = useAuth()
  const perfil = useCarga('mi-perfil-cliente', traerPerfilCliente)

  // null = viendo; con datos = editando
  const [form, setForm] = useState<Formulario | null>(null)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contraseñaAbierta, setContraseñaAbierta] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const editando = form !== null
  // Los catálogos de ubicación solo se piden al editar (la demo no tiene back: no se puede cambiar la zona)
  const conCatalogos = editando && !tokenStorage.esDemo()
  const provincias = useListado<Provincia>(conCatalogos ? '/provincia' : null)
  const localidades = useListado<Localidad>(conCatalogos && form?.idProvincia ? `/localidad?provincia=${form.idProvincia}` : null)
  const zonas = useListado<Zona>(conCatalogos && form?.idLocalidad ? `/zona?localidad=${form.idLocalidad}` : null)

  if (perfil.cargando) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={130} />
        <Skeleton variant="rounded" height={240} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    )
  }
  if (!perfil.datos) {
    return <Alert severity="error">{perfil.error ?? 'No se pudo cargar tu perfil'}</Alert>
  }

  const p = perfil.datos
  const datos = form ?? desdePerfil(p)
  const errores = form && intentoGuardar ? validar(form) : {}
  const zonaActual = p.zonaResidencia
  const ubicacionActual = zonaActual
    ? [zonaActual.nombreZona, zonaActual.localidad?.nombreLocalidad, zonaActual.localidad?.provincia?.nombreProvincia].filter(Boolean).join(', ')
    : 'Sin zona'

  const cambiar = (cambios: Partial<Formulario>) => setForm((f) => (f ? { ...f, ...cambios } : f))

  // Campo de texto: editable al editar, solo lectura si no
  const campo = (nombre: keyof Formulario, label: string, extra: { ayuda?: string; soloNumeros?: number; max?: number } = {}) => ({
    label,
    value: datos[nombre],
    onChange: (e: { target: { value: string } }) => {
      let valor = e.target.value
      if (extra.soloNumeros) valor = valor.replace(/\D/g, '').slice(0, extra.soloNumeros)
      if (extra.max) valor = valor.slice(0, extra.max)
      cambiar({ [nombre]: valor })
    },
    error: Boolean(errores[nombre]),
    helperText: errores[nombre] ?? (editando ? extra.ayuda : undefined),
    fullWidth: true,
    slotProps: {
      input: { readOnly: !editando },
      htmlInput: extra.soloNumeros ? { inputMode: 'numeric' as const } : undefined,
    },
  })

  // Datos que no se cambian (DNI y fecha de nacimiento)
  const fijo = (label: string, valor: string) => (
    <TextField
      label={label}
      value={valor}
      fullWidth
      helperText={editando ? 'No se puede cambiar' : undefined}
      slotProps={{ input: { readOnly: true, endAdornment: <LockIcon fontSize="small" color="disabled" /> } }}
      sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
    />
  )

  // Un desplegable de ubicación. Mientras no cargan las opciones, muestra el valor actual
  const desplegable = (
    nombre: 'idProvincia' | 'idLocalidad' | 'idZona',
    label: string,
    opciones: { id: number; nombre: string }[],
    actual: { id: number; nombre: string } | null,
    alCambiar: (valor: string) => void,
    deshabilitado = false,
  ) => {
    const lista = actual && !opciones.some((o) => o.id === actual.id) && String(actual.id) === datos[nombre] ? [actual, ...opciones] : opciones
    return (
      <TextField
        select
        fullWidth
        label={label}
        value={datos[nombre]}
        disabled={deshabilitado}
        onChange={(e) => alCambiar(e.target.value)}
        error={Boolean(errores[nombre])}
        helperText={errores[nombre]}
      >
        {lista.map((o) => (
          <MenuItem key={o.id} value={String(o.id)}>
            {o.nombre}
          </MenuItem>
        ))}
      </TextField>
    )
  }

  const empezarAEditar = () => {
    setForm(desdePerfil(p))
    setIntentoGuardar(false)
    setError(null)
  }

  const guardar = async () => {
    if (!form) return
    setIntentoGuardar(true)
    setError(null)
    if (Object.keys(validar(form)).length > 0) return

    const cambios: CambiosPerfilCliente = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono,
      calle: form.calle.trim(),
      altura: Number(form.altura),
      // Vacío = se borra (una casa no tiene piso ni depto)
      piso: form.piso.trim() || null,
      depto: form.depto.trim() || null,
      idZonaResidencia: Number(form.idZona),
    }
    // La zona con su localidad y provincia (solo la usa la demo para mostrarla)
    const zonaElegida = zonas.datos.find((z) => String(z.idZona) === form.idZona)
    const localidad = localidades.datos.find((l) => String(l.idLocalidad) === form.idLocalidad)
    const provincia = provincias.datos.find((pr) => String(pr.idProvincia) === form.idProvincia)
    const zona: PerfilCliente['zonaResidencia'] =
      zonaElegida && localidad && provincia
        ? { idZona: zonaElegida.idZona, nombreZona: zonaElegida.nombreZona, localidad: { ...localidad, provincia } }
        : p.zonaResidencia

    setGuardando(true)
    try {
      await guardarPerfilCliente(p.idUsuario, cambios, zona)
      // Si cambió el email, la sesión lo muestra actualizado (el próximo login es con el nuevo)
      if (cambios.correo !== p.correo && sesion) actualizarCorreo(cambios.correo)
      setForm(null)
      setMensaje(cambios.correo !== p.correo ? 'Perfil actualizado. La próxima vez entrá con tu email nuevo' : 'Perfil actualizado')
      perfil.recargar()
    } catch (e) {
      // Ej: "Ese correo ya está registrado en otra cuenta"
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  const botones = editando ? (
    <Stack direction="row" spacing={1}>
      <Button onClick={() => setForm(null)} disabled={guardando}>
        Cancelar
      </Button>
      <Button variant="contained" onClick={guardar} loading={guardando}>
        Guardar cambios
      </Button>
    </Stack>
  ) : (
    <Button variant="contained" startIcon={<EditIcon />} onClick={empezarAEditar}>
      Editar perfil
    </Button>
  )

  const actualDe = {
    provincia: zonaActual?.localidad?.provincia ? { id: zonaActual.localidad.provincia.idProvincia, nombre: zonaActual.localidad.provincia.nombreProvincia } : null,
    localidad: zonaActual?.localidad ? { id: zonaActual.localidad.idLocalidad, nombre: zonaActual.localidad.nombreLocalidad } : null,
    zona: zonaActual ? { id: zonaActual.idZona, nombre: zonaActual.nombreZona } : null,
  }
  const errorCatalogos = provincias.error ?? localidades.error ?? zonas.error

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Mi perfil
      </Typography>

      {/* Encabezado: foto, nombre y dónde vive */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
          <AvatarPersona nombre={p.nombre} apellido={p.apellido} tamaño={88} />
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {p.nombre} {p.apellido}
            </Typography>
            <Typography color="text.secondary">{p.correo}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', mt: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <PlaceIcon fontSize="small" />
              <Typography variant="body2">{ubicacionActual}</Typography>
            </Stack>
          </Box>
          <Box sx={{ flexShrink: 0 }}>{botones}</Box>
        </Stack>
      </Paper>

      {editando && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {editando && errorCatalogos && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar las listas para elegir la zona: {errorCatalogos}
        </Alert>
      )}

      <Stack spacing={2}>
        <SeccionTarjeta titulo="Datos personales">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>{fijo('DNI', String(p.dni))}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>{fijo('Fecha de nacimiento', dayjs(p.fechaNacimiento).format('DD/MM/YYYY'))}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...campo('nombre', 'Nombre')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...campo('apellido', 'Apellido')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...campo('correo', 'Email', { ayuda: 'Es tu usuario para entrar: si lo cambiás, entrás con el nuevo' })} type="email" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...campo('telefono', 'Teléfono', { soloNumeros: 15, ayuda: 'Con característica. El profesional te escribe por WhatsApp a este número' })} />
            </Grid>
          </Grid>
        </SeccionTarjeta>

        <SeccionTarjeta titulo="Mi domicilio">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Es donde van los profesionales. Con tu zona te mostramos los que trabajan cerca.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...campo('calle', 'Calle', { max: 100 })} />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField {...campo('altura', 'Altura', { soloNumeros: 6 })} />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField {...campo('piso', 'Piso', { max: 10 })} placeholder={editando ? 'Opcional' : '—'} />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField {...campo('depto', 'Depto', { max: 10 })} placeholder={editando ? 'Opcional' : '—'} />
            </Grid>

            {editando && !tokenStorage.esDemo() ? (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  {desplegable(
                    'idProvincia',
                    'Provincia',
                    provincias.datos.map((pr) => ({ id: pr.idProvincia, nombre: pr.nombreProvincia })),
                    actualDe.provincia,
                    (v) => cambiar({ idProvincia: v, idLocalidad: '', idZona: '' }),
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  {desplegable(
                    'idLocalidad',
                    'Localidad',
                    localidades.datos.map((l) => ({ id: l.idLocalidad, nombre: l.nombreLocalidad })),
                    actualDe.localidad,
                    (v) => cambiar({ idLocalidad: v, idZona: '' }),
                    !datos.idProvincia,
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  {desplegable(
                    'idZona',
                    'Zona / barrio',
                    zonas.datos.map((z) => ({ id: z.idZona, nombre: z.nombreZona })),
                    actualDe.zona,
                    (v) => cambiar({ idZona: v }),
                    !datos.idLocalidad,
                  )}
                </Grid>
                {datos.idLocalidad && zonas.datos.length === 0 && !zonas.error && (
                  <Grid size={12}>
                    <Alert severity="info">Esa localidad todavía no tiene zonas cargadas: elegí otra.</Alert>
                  </Grid>
                )}
              </>
            ) : (
              <Grid size={12}>
                <TextField
                  label="Zona"
                  value={ubicacionActual}
                  fullWidth
                  helperText={editando ? 'En la sesión de prueba no se puede cambiar la zona' : undefined}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
            )}
          </Grid>
        </SeccionTarjeta>

        {editando ? (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            {botones}
          </Stack>
        ) : (
          <SeccionTarjeta titulo="Cuenta">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="outlined" startIcon={<KeyIcon />} onClick={() => setContraseñaAbierta(true)}>
                Cambiar contraseña
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Cerrar sesión
              </Button>
            </Stack>
            <BajaCuentaButton idUsuario={p.idUsuario} />
          </SeccionTarjeta>
        )}
      </Stack>

      <CambiarContrasenaDialog
        open={contraseñaAbierta}
        onClose={() => setContraseñaAbierta(false)}
        onCambiada={() => {
          setContraseñaAbierta(false)
          setMensaje('Contraseña cambiada')
        }}
      />

      <Snackbar open={mensaje !== null} autoHideDuration={4000} onClose={() => setMensaje(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {mensaje ? (
          <Alert severity="success" variant="filled" onClose={() => setMensaje(null)}>
            {mensaje}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}
