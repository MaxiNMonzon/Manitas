import { useState } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import { borrar, crear, editar, listar, type Fila } from '../../api/catalogos'
import { useCarga } from '../../hooks/useCarga'
import { catalogoPorClave, type Campo, type Catalogo, type Referencia } from './catalogos'

const POR_PAGINA = 50
const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Lista de opciones de una referencia (ej: las especialidades para elegir la de un tipo de servicio)
function useOpciones(referencia: Referencia | undefined) {
  const carga = useCarga(`opciones-${referencia?.path ?? 'ninguna'}`, () => (referencia ? listar(referencia.path) : Promise.resolve([])))
  const opciones = (carga.datos ?? []).map((f) => ({ id: Number(f[referencia!.id]), label: referencia!.etiqueta(f) }))
  return { opciones, cargando: carga.cargando, error: carga.error }
}

type Opcion = { id: number; label: string }

// Elegir una (o varias) filas de otro catálogo, con búsqueda (ej: la localidad de una zona)
function CampoReferencia({ campo, valor, onChange, error }: { campo: Campo; valor: unknown; onChange: (v: unknown) => void; error?: string }) {
  const { opciones, cargando } = useOpciones(campo.referencia)
  const etiqueta = `${campo.label}${campo.requerido ? ' *' : ''}`
  if (campo.tipo === 'referencias') {
    const ids = Array.isArray(valor) ? (valor as number[]) : []
    return (
      <Autocomplete<Opcion, true>
        multiple
        loading={cargando}
        options={opciones}
        value={opciones.filter((o) => ids.includes(o.id))}
        onChange={(_, elegidas) => onChange(elegidas.map((o) => o.id))}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderInput={(p) => <TextField {...p} label={etiqueta} error={Boolean(error)} helperText={error ?? campo.ayuda} />}
      />
    )
  }
  return (
    <Autocomplete<Opcion>
      loading={cargando}
      options={opciones}
      value={opciones.find((o) => o.id === Number(valor)) ?? null}
      onChange={(_, elegida) => onChange(elegida?.id ?? null)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(p) => <TextField {...p} label={etiqueta} error={Boolean(error)} helperText={error ?? campo.ayuda} />}
    />
  )
}

// Alta o edición: arma el formulario con los campos del catálogo
function FormularioDialog({
  catalogo,
  fila,
  abierto,
  onClose,
  onGuardado,
}: {
  catalogo: Catalogo
  fila: Fila | null // null = alta
  abierto: boolean
  onClose: () => void
  onGuardado: (mensaje: string) => void
}) {
  const inicial = () =>
    Object.fromEntries(
      catalogo.campos.map((c) => {
        const desdeFila = fila ? (c.desdeFila ? c.desdeFila(fila) : fila[c.clave]) : undefined
        const vacio = c.tipo === 'referencias' ? [] : c.tipo === 'referencia' ? null : ''
        return [c.clave, desdeFila ?? vacio]
      }),
    )
  const [valores, setValores] = useState<Fila>(inicial)
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const errores = Object.fromEntries(
    catalogo.campos
      .filter((c) => c.requerido)
      .filter((c) => {
        const v = valores[c.clave]
        return v === null || v === undefined || String(v).trim() === '' || (c.tipo === 'numero' && Number.isNaN(Number(v)))
      })
      .map((c) => [c.clave, 'Completá este dato']),
  ) as Record<string, string>

  const guardar = async () => {
    setIntento(true)
    if (Object.keys(errores).length > 0) return
    // Arma el cuerpo como lo espera el DTO del back
    const cuerpo: Fila = {}
    for (const c of catalogo.campos) {
      const v = valores[c.clave]
      if (c.tipo === 'numero' || c.tipo === 'referencia') {
        if (v !== null && v !== '') cuerpo[c.clave] = Number(v)
      } else if (c.tipo === 'referencias') {
        cuerpo[c.clave] = v
      } else {
        const t = String(v ?? '').trim()
        // Un opcional vacío: en el alta no se manda; al editar se borra
        if (t) cuerpo[c.clave] = t
        else if (fila) cuerpo[c.clave] = null
      }
    }
    setGuardando(true)
    setError(null)
    try {
      if (fila) await editar(catalogo.path, Number(fila[catalogo.id]), cuerpo)
      else await crear(catalogo.path, cuerpo)
      onGuardado(fila ? 'Cambios guardados.' : 'Alta guardada.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{fila ? `Editar ${catalogo.singular}` : `Agregar ${catalogo.singular}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {catalogo.campos.map((c) => {
            const err = intento ? errores[c.clave] : undefined
            const cambiar = (v: unknown) => setValores((actual) => ({ ...actual, [c.clave]: v }))
            if (c.tipo === 'referencia' || c.tipo === 'referencias') {
              return <CampoReferencia key={c.clave} campo={c} valor={valores[c.clave]} onChange={cambiar} error={err} />
            }
            return (
              <TextField
                key={c.clave}
                select={c.tipo === 'opciones'}
                label={c.label}
                required={c.requerido}
                type={c.tipo === 'numero' ? 'number' : c.tipo === 'fecha' ? 'date' : 'text'}
                multiline={c.tipo === 'textoLargo'}
                minRows={c.tipo === 'textoLargo' ? 2 : undefined}
                value={valores[c.clave] ?? ''}
                onChange={(e) => cambiar(e.target.value)}
                error={Boolean(err)}
                helperText={err ?? c.ayuda}
                slotProps={c.tipo === 'fecha' ? { inputLabel: { shrink: true } } : undefined}
              >
                {(c.opciones ?? []).map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            )
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar} loading={guardando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Pantalla de un catálogo del administrador: listado con filtro y búsqueda, detalle, alta, edición y baja.
// Cuál catálogo se muestra sale de la URL (/app/catalogos/:clave) y de su configuración en catalogos.ts
export default function CatalogoAdmin() {
  const { clave } = useParams()
  const catalogo = catalogoPorClave(clave)
  if (!catalogo) return <Navigate to="/app" replace />
  // key: al cambiar de catálogo se arranca de cero (filtros, búsqueda, diálogos)
  return <PantallaCatalogo key={catalogo.clave} catalogo={catalogo} />
}

function PantallaCatalogo({ catalogo }: { catalogo: Catalogo }) {
  const theme = useTheme()
  const angosto = useMediaQuery(theme.breakpoints.down('sm'))
  const [idFiltro, setIdFiltro] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)
  const [detalle, setDetalle] = useState<Fila | null>(null)
  const [formulario, setFormulario] = useState<{ fila: Fila | null; version: number } | null>(null)
  const [aBorrar, setABorrar] = useState<Fila | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null)

  const filtro = catalogo.filtro
  const opcionesFiltro = useOpciones(filtro?.referencia)
  const filas = useCarga(`catalogo-${catalogo.path}-${idFiltro}`, () =>
    listar(catalogo.path, filtro && idFiltro ? { [filtro.param]: idFiltro } : undefined),
  )

  const buscado = normalizar(busqueda.trim())
  const visibles = (filas.datos ?? []).filter(
    (f) => !buscado || normalizar(catalogo.columnas.map((c) => c.valor(f)).join(' ')).includes(buscado),
  )

  const confirmarBorrado = async () => {
    if (!aBorrar) return
    setBorrando(true)
    try {
      await borrar(catalogo.path, Number(aBorrar[catalogo.id]))
      setMensaje({ texto: 'Dado de baja.', tipo: 'success' })
      setABorrar(null)
      setDetalle(null)
      filas.recargar()
    } catch (e) {
      setMensaje({ texto: e instanceof Error ? e.message : 'No se pudo dar de baja', tipo: 'error' })
    } finally {
      setBorrando(false)
    }
  }

  const titulo = (f: Fila) => catalogo.columnas[0].valor(f)

  return (
    <>
      <Button component={RouterLink} to="/app/catalogos" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
        Catálogos
      </Button>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {catalogo.titulo}
        </Typography>
        {!catalogo.soloLectura && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormulario({ fila: null, version: Date.now() })}>
            Agregar
          </Button>
        )}
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {catalogo.descripcion}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Buscar ${catalogo.titulo.toLowerCase()}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setCantidadVisible(POR_PAGINA)
            }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          />
          {filtro && (
            <Autocomplete<Opcion>
              size="small"
              sx={{ minWidth: { md: 300 } }}
              loading={opcionesFiltro.cargando}
              options={opcionesFiltro.opciones}
              value={opcionesFiltro.opciones.find((o) => o.id === idFiltro) ?? null}
              onChange={(_, elegida) => {
                setIdFiltro(elegida?.id ?? null)
                setCantidadVisible(POR_PAGINA)
              }}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(p) => <TextField {...p} label={`Filtrar por ${filtro.label.toLowerCase()}`} />}
            />
          )}
        </Stack>
      </Paper>

      {filas.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {filas.error}
        </Alert>
      )}

      {filas.cargando ? (
        <Skeleton variant="rounded" height={240} />
      ) : visibles.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No hay {catalogo.titulo.toLowerCase()} con esos filtros.</Typography>
        </Paper>
      ) : angosto ? (
        // Celular: una tarjeta por fila
        <Stack spacing={1}>
          {visibles.slice(0, cantidadVisible).map((f) => (
            <Paper key={String(f[catalogo.id])} variant="outlined" sx={{ p: 1.5, cursor: 'pointer' }} onClick={() => setDetalle(f)}>
              <Typography sx={{ fontWeight: 600 }}>{titulo(f)}</Typography>
              {catalogo.columnas.slice(1).map((c) => (
                <Typography key={c.label} variant="body2" color="text.secondary">
                  {c.label}: {c.valor(f)}
                </Typography>
              ))}
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {catalogo.columnas.map((c) => (
                  <TableCell key={c.label} sx={{ fontWeight: 700 }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.slice(0, cantidadVisible).map((f) => (
                <TableRow key={String(f[catalogo.id])} hover sx={{ cursor: 'pointer' }} onClick={() => setDetalle(f)}>
                  {catalogo.columnas.map((c) => (
                    <TableCell key={c.label} sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap>
                        {c.valor(f)}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {visibles.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((c) => c + POR_PAGINA)}>Ver más ({visibles.length - cantidadVisible})</Button>
        </Box>
      )}

      {/* Detalle */}
      <Dialog open={detalle !== null} onClose={() => setDetalle(null)} fullWidth maxWidth="sm" fullScreen={angosto}>
        {detalle && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              {titulo(detalle)}
              <IconButton aria-label="Cerrar" onClick={() => setDetalle(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1}>
                {[...catalogo.columnas.map((c) => [c.label, c.valor(detalle)] as [string, string]), ...(catalogo.detalle?.(detalle) ?? [])]
                  // Sin repetir datos que ya están en las columnas
                  .filter(([label], i, todos) => todos.findIndex(([l]) => l === label) === i)
                  .map(([label, valor]) => (
                    <Stack key={label} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'right', whiteSpace: 'pre-line' }}>
                        {valor}
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </DialogContent>
            {!catalogo.soloLectura && (
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => setABorrar(detalle)} sx={{ mr: 'auto' }}>
                  Dar de baja
                </Button>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setFormulario({ fila: detalle, version: Date.now() })}>
                  Editar
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>

      {/* Alta / edición (la key reinicia el formulario cada vez que se abre) */}
      {formulario && (
        <FormularioDialog
          key={formulario.version}
          catalogo={catalogo}
          fila={formulario.fila}
          abierto
          onClose={() => setFormulario(null)}
          onGuardado={(texto) => {
            setFormulario(null)
            setDetalle(null)
            setMensaje({ texto, tipo: 'success' })
            filas.recargar()
          }}
        />
      )}

      {/* Confirmar baja */}
      <Dialog open={aBorrar !== null} onClose={() => setABorrar(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Dar de baja?</DialogTitle>
        <DialogContent>
          <Typography>
            {aBorrar && `"${titulo(aBorrar)}" deja de estar disponible. Lo que ya la usa (solicitudes, perfiles) no se modifica.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setABorrar(null)}>Volver</Button>
          <Button variant="contained" color="error" onClick={confirmarBorrado} loading={borrando}>
            Dar de baja
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje !== null} autoHideDuration={4000} onClose={() => setMensaje(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {mensaje ? (
          <Alert severity={mensaje.tipo} variant="filled" onClose={() => setMensaje(null)}>
            {mensaje.texto}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}
