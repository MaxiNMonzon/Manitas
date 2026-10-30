import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import KeyIcon from '@mui/icons-material/Key'
import HelpCenterIcon from '@mui/icons-material/HelpCenter'
import dayjs from 'dayjs'
import { useAuth } from '../../auth/useAuth'
import { guardarPerfilProfesional, traerPerfilProfesional } from '../../api/perfil'
import { traerMiCalificacion } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import { useListado } from '../../hooks/useListado'
import AvatarPersona from '../../components/AvatarPersona'
import SeccionTarjeta from '../../components/SeccionTarjeta'
import SelectorConChips, { type Opcion } from '../../components/SelectorConChips'
import CambiarContrasenaDialog from '../../components/perfil/CambiarContrasenaDialog'
import BajaCuentaButton from '../../components/perfil/BajaCuentaButton'
import EditorMatriculas, { ListaMatriculas } from '../../components/perfil/EditorMatriculas'
import { erroresMatriculas, matriculasParaEnviar, type MatriculaForm } from '../../components/perfil/matriculas'
import { cbuValido, entidadDeCuenta } from '../../components/perfil/cuentaBancaria'
import type { CambiosPerfilProfesional, Especialidad, Localidad, PerfilProfesional as Perfil, Provincia, TipoDeServicio, Zona } from '../../types'

const MAX_DESCRIPCION = 2000

// Lo que se puede editar (como texto, igual que en los campos) y lo elegido en las listas
interface Formulario {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  costoVisita: string
  descripcion: string
  cbu: string
  // Provincia y localidad solo sirven para buscar zonas nuevas
  idProvincia: string
  idLocalidad: string
  especialidades: Opcion[]
  habilidades: Opcion[]
  zonas: Opcion[]
  matriculas: MatriculaForm[]
}
type Errores = Partial<Record<keyof Formulario, string>>

const etiquetaZona = (z: Perfil['zonasDeCobertura'][number]) =>
  z.localidad ? `${z.nombreZona} (${z.localidad.nombreLocalidad})` : z.nombreZona

function desdePerfil(p: Perfil): Formulario {
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    correo: p.correo,
    telefono: p.telefono,
    costoVisita: p.costoVisita != null ? String(p.costoVisita) : '',
    descripcion: p.descripcion ?? '',
    cbu: p.cbu ?? '',
    idProvincia: '',
    idLocalidad: '',
    especialidades: p.especialidades.map((e) => ({ id: e.idEspecialidad, label: e.nombreEspecialidad })),
    habilidades: p.tiposDeServicio.map((t) => ({
      id: t.idServicio,
      label: t.nombreServicio,
      grupo: t.especialidad?.nombreEspecialidad,
      grupoId: t.especialidad?.idEspecialidad,
    })),
    zonas: p.zonasDeCobertura.map((z) => ({ id: z.idZona, label: etiquetaZona(z) })),
    matriculas: p.matriculas.map((m, i) => ({
      clave: i + 1,
      numero: m.numero,
      descripcion: m.descripcion ?? '',
      idEspecialidad: String(m.especialidad.idEspecialidad),
    })),
  }
}

// Mismas reglas que el back (UpdateProfesionalDto), más el control de los dígitos del CBU
function validar(f: Formulario): Errores {
  const e: Errores = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(f.telefono)) e.telefono = 'Ingresá solo números, con característica'
  if (f.costoVisita && !/^\d+$/.test(f.costoVisita)) e.costoVisita = 'Solo números, sin puntos'
  if (f.cbu && f.cbu.length !== 22) e.cbu = 'El CBU/CVU tiene 22 números'
  else if (f.cbu && !cbuValido(f.cbu)) e.cbu = 'Ese CBU no es válido: revisá que esté bien copiado'
  if (f.descripcion.length > MAX_DESCRIPCION) e.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  if (f.especialidades.length === 0) e.especialidades = 'Elegí al menos una especialidad'
  if (f.zonas.length === 0) e.zonas = 'Elegí al menos una zona de trabajo'
  if (Object.keys(erroresMatriculas(f.matriculas)).length > 0) e.matriculas = 'Revisá las matrículas'
  return e
}

// Lista de burbujas cuando no se está editando
function ChipsLectura({ label, items, vacio }: { label: string; items: Opcion[]; vacio: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5, p: 1, minHeight: 56, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 0.5 }}>
            {vacio}
          </Typography>
        ) : (
          items.map((i) => <Chip key={i.id} label={i.label} color="primary" variant="outlined" />)
        )}
      </Box>
    </Box>
  )
}

// Pestaña "Mi perfil" del profesional (boceto "Mi perfil"): se ve todo y con "Editar perfil" se puede cambiar
export default function PerfilProfesional() {
  const navigate = useNavigate()
  const { sesion, logout, actualizarCorreo } = useAuth()
  const perfil = useCarga('mi-perfil', traerPerfilProfesional)
  const calificacion = useCarga('mi-calificacion', traerMiCalificacion)

  // null = viendo; con datos = editando
  const [form, setForm] = useState<Formulario | null>(null)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contraseñaAbierta, setContraseñaAbierta] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const editando = form !== null
  // Los catálogos solo se piden al editar
  const especialidades = useListado<Especialidad>(editando ? '/especialidad' : null)
  const tiposDeServicio = useListado<TipoDeServicio>(editando ? '/tipos-de-servicio' : null)
  const provincias = useListado<Provincia>(editando ? '/provincia' : null)
  const localidades = useListado<Localidad>(form?.idProvincia ? `/localidad?provincia=${form.idProvincia}` : null)
  const zonas = useListado<Zona>(form?.idLocalidad ? `/zona?localidad=${form.idLocalidad}` : null)

  if (perfil.cargando) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={150} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={260} />
      </Stack>
    )
  }
  if (!perfil.datos) {
    return <Alert severity="error">{perfil.error ?? 'No se pudo cargar tu perfil'}</Alert>
  }

  const p = perfil.datos
  const datos = form ?? desdePerfil(p)
  const errores = form && intentoGuardar ? validar(form) : {}
  const banco = entidadDeCuenta(datos.cbu)

  // ---- Opciones de las listas (al editar) ----
  const opcionesEspecialidades: Opcion[] = especialidades.datos.map((e) => ({ id: e.idEspecialidad, label: e.nombreEspecialidad }))
  const idsEspecialidades = new Set(datos.especialidades.map((e) => e.id))
  const opcionesHabilidades: Opcion[] = tiposDeServicio.datos
    .filter((t) => idsEspecialidades.has(t.especialidad.idEspecialidad))
    .map((t) => ({ id: t.idServicio, label: t.nombreServicio, grupo: t.especialidad.nombreEspecialidad, grupoId: t.especialidad.idEspecialidad }))
    .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.label.localeCompare(b.label))
  const localidadElegida = localidades.datos.find((l) => String(l.idLocalidad) === datos.idLocalidad)
  const opcionesZonas: Opcion[] = zonas.datos.map((z) => ({
    id: z.idZona,
    label: localidadElegida ? `${z.nombreZona} (${localidadElegida.nombreLocalidad})` : z.nombreZona,
  }))
  const errorCatalogos = especialidades.error ?? tiposDeServicio.error ?? provincias.error

  const cambiar = (cambios: Partial<Formulario>) => setForm((f) => (f ? { ...f, ...cambios } : f))

  // Campo de texto: editable al editar, solo lectura si no
  const campo = (nombre: keyof Formulario, label: string, extra: { ayuda?: string; soloNumeros?: number; adelante?: ReactNode } = {}) => ({
    label,
    value: datos[nombre] as string,
    onChange: (e: { target: { value: string } }) => {
      let valor = e.target.value
      if (extra.soloNumeros) valor = valor.replace(/\D/g, '').slice(0, extra.soloNumeros)
      cambiar({ [nombre]: valor })
    },
    error: Boolean(errores[nombre]),
    helperText: errores[nombre] ?? (editando ? extra.ayuda : undefined),
    fullWidth: true,
    slotProps: {
      input: { readOnly: !editando, startAdornment: extra.adelante },
      htmlInput: extra.soloNumeros ? { inputMode: 'numeric' as const } : undefined,
    },
  })

  // Datos que no se cambian (DNI y fecha de nacimiento)
  const fijo = (label: string, valor: string, ayuda?: string) => (
    <TextField
      label={label}
      value={valor}
      fullWidth
      helperText={editando ? ayuda : undefined}
      slotProps={{ input: { readOnly: true, endAdornment: <LockIcon fontSize="small" color="disabled" /> } }}
      sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
    />
  )

  const empezarAEditar = () => {
    setForm(desdePerfil(p))
    setIntentoGuardar(false)
    setError(null)
  }

  const cambiarEspecialidades = (elegidas: Opcion[]) => {
    const ids = new Set(elegidas.map((e) => e.id))
    // Si se saca una especialidad, también se sacan sus habilidades y sus matrículas
    setForm(
      (f) =>
        f && {
          ...f,
          especialidades: elegidas,
          habilidades: f.habilidades.filter((h) => h.grupoId === undefined || ids.has(h.grupoId)),
          matriculas: f.matriculas.filter((m) => !m.idEspecialidad || ids.has(Number(m.idEspecialidad))),
        },
    )
  }

  const guardar = async () => {
    if (!form) return
    setIntentoGuardar(true)
    setError(null)
    if (Object.keys(validar(form)).length > 0) return

    const cambios: CambiosPerfilProfesional = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono,
      matriculas: matriculasParaEnviar(form.matriculas),
      // Vacío = se borra el dato opcional
      costoVisita: form.costoVisita ? Number(form.costoVisita) : null,
      descripcion: form.descripcion.trim() || null,
      cbu: form.cbu || null,
      idsEspecialidades: form.especialidades.map((o) => o.id),
      idsTiposDeServicio: form.habilidades.map((o) => o.id),
      idsZonasCobertura: form.zonas.map((o) => o.id),
    }
    setGuardando(true)
    try {
      await guardarPerfilProfesional(p.idUsuario, cambios, {
        especialidades: form.especialidades.map((o) => ({ idEspecialidad: o.id, nombreEspecialidad: o.label })),
        tiposDeServicio: form.habilidades.map((o) => ({
          idServicio: o.id,
          nombreServicio: o.label,
          especialidad: o.grupoId !== undefined ? { idEspecialidad: o.grupoId, nombreEspecialidad: o.grupo ?? '' } : undefined,
        })),
        zonasDeCobertura: form.zonas.map((o) => ({ idZona: o.id, nombreZona: o.label })),
      })
      // Si cambió el email, la sesión lo muestra actualizado (el próximo login es con el nuevo)
      if (cambios.correo !== p.correo && sesion) actualizarCorreo(cambios.correo)
      setForm(null)
      setMensaje(cambios.correo !== p.correo ? 'Perfil actualizado. La próxima vez entrá con tu email nuevo' : 'Perfil actualizado')
      perfil.recargar()
    } catch (e) {
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

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Mi perfil
      </Typography>

      {/* Encabezado: foto, nombre, especialidades y calificación */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title="Subir foto: próximamente">
                <span>
                  <IconButton size="small" disabled sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&.Mui-disabled': { bgcolor: 'background.paper' } }}>
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            }
          >
            <AvatarPersona nombre={p.nombre} apellido={p.apellido} tamaño={96} />
          </Badge>
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {p.nombre} {p.apellido}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', my: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              {p.especialidades.map((e) => (
                <Chip key={e.idEspecialidad} size="small" color="primary" label={e.nombreEspecialidad} />
              ))}
              {p.matriculas.length > 0 && (
                <Tooltip title={p.matriculas.map((m) => `${m.especialidad.nombreEspecialidad}: ${m.numero}`).join(' · ')}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={p.matriculas.length === 1 ? `Matrícula ${p.matriculas[0].numero}` : `${p.matriculas.length} matrículas`}
                  />
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Rating value={calificacion.datos?.promedio ?? 0} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {calificacion.datos?.promedio != null
                  ? `${calificacion.datos.promedio.toLocaleString('es-AR')} · ${calificacion.datos.cantidad} calificaciones`
                  : 'Todavía sin calificaciones'}
              </Typography>
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
          No se pudieron cargar las listas para elegir: {errorCatalogos}
        </Alert>
      )}

      <Stack spacing={2}>
        <SeccionTarjeta titulo="Datos personales">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>{fijo('DNI', String(p.dni), 'No se puede cambiar')}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>{fijo('Fecha de nacimiento', dayjs(p.fechaNacimiento).format('DD/MM/YYYY'), 'No se puede cambiar')}</Grid>
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
              <TextField {...campo('telefono', 'Teléfono', { soloNumeros: 15, ayuda: 'Con característica. Tus clientes te escriben por WhatsApp a este número' })} />
            </Grid>

            {/* Solo al editar: sirven para buscar zonas de trabajo nuevas (no se guardan) */}
            {editando && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Provincia"
                    value={datos.idProvincia}
                    onChange={(e) => cambiar({ idProvincia: e.target.value, idLocalidad: '' })}
                    helperText="Para buscar zonas de trabajo nuevas"
                  >
                    {provincias.datos.map((pr) => (
                      <MenuItem key={pr.idProvincia} value={String(pr.idProvincia)}>
                        {pr.nombreProvincia}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Localidad"
                    value={datos.idLocalidad}
                    disabled={!datos.idProvincia}
                    onChange={(e) => cambiar({ idLocalidad: e.target.value })}
                  >
                    {localidades.datos.map((l) => (
                      <MenuItem key={l.idLocalidad} value={String(l.idLocalidad)}>
                        {l.nombreLocalidad}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </SeccionTarjeta>

        <SeccionTarjeta titulo="Mi trabajo">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...campo('costoVisita', 'Costo de la visita', {
                  soloNumeros: 9,
                  adelante: <InputAdornment position="start">$</InputAdornment>,
                  ayuda: 'Solo se cobra si el cliente rechaza el presupuesto. Vacío = no cobrás la visita',
                })}
                placeholder={editando ? '0' : 'No cobra la visita'}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              {editando ? (
                <SelectorConChips
                  label="Especialidades"
                  required
                  opciones={opcionesEspecialidades}
                  seleccionados={datos.especialidades}
                  onChange={cambiarEspecialidades}
                  error={errores.especialidades}
                />
              ) : (
                <ChipsLectura label="Especialidades" items={datos.especialidades} vacio="Sin especialidades" />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {editando ? (
                <SelectorConChips
                  label="Habilidades"
                  opciones={opcionesHabilidades}
                  seleccionados={datos.habilidades}
                  onChange={(habilidades) => cambiar({ habilidades })}
                  disabled={datos.especialidades.length === 0}
                  ayuda={datos.especialidades.length === 0 ? 'Primero elegí una especialidad' : undefined}
                />
              ) : (
                <ChipsLectura label="Habilidades" items={datos.habilidades} vacio="Sin habilidades cargadas" />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {editando ? (
                <SelectorConChips
                  label="Zonas de trabajo"
                  required
                  opciones={opcionesZonas}
                  seleccionados={datos.zonas}
                  onChange={(z) => cambiar({ zonas: z })}
                  ayuda={!datos.idLocalidad ? 'Para agregar, elegí provincia y localidad en Datos personales' : undefined}
                  error={errores.zonas}
                />
              ) : (
                <ChipsLectura label="Zonas de trabajo" items={datos.zonas} vacio="Sin zonas" />
              )}
            </Grid>

            <Grid size={12}>
              {editando ? (
                <EditorMatriculas
                  especialidades={datos.especialidades}
                  matriculas={datos.matriculas}
                  onChange={(matriculas) => cambiar({ matriculas })}
                  errores={intentoGuardar ? erroresMatriculas(datos.matriculas) : undefined}
                />
              ) : (
                <ListaMatriculas
                  matriculas={p.matriculas.map((m) => ({ numero: m.numero, descripcion: m.descripcion, especialidad: m.especialidad.nombreEspecialidad }))}
                />
              )}
            </Grid>

            <Grid size={12}>
              <TextField
                {...campo('descripcion', 'Sobre mí y mi trabajo', {
                  ayuda: `Lo ven los clientes al elegirte · ${datos.descripcion.length}/${MAX_DESCRIPCION}`,
                })}
                multiline
                minRows={3}
                placeholder={editando ? 'Contá tu experiencia, qué trabajos hacés, cómo trabajás...' : 'Todavía no escribiste nada sobre vos'}
              />
            </Grid>
          </Grid>
        </SeccionTarjeta>

        <SeccionTarjeta titulo="Datos para cobrar">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                {...campo('cbu', 'CBU / CVU', { soloNumeros: 22, ayuda: `${datos.cbu.length}/22 números. Ahí se depositan tus cobros` })}
                placeholder={editando ? '' : 'Sin cargar: no vas a poder recibir los depósitos'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Banco"
                value={banco ?? (datos.cbu ? 'Completá los 22 números' : '—')}
                fullWidth
                helperText={editando ? 'Se completa solo con el CBU/CVU' : undefined}
                slotProps={{ input: { readOnly: true } }}
                sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
              />
            </Grid>
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
              <Button variant="outlined" startIcon={<HelpCenterIcon />} onClick={() => navigate('/app/ayuda')}>
                Ayuda
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