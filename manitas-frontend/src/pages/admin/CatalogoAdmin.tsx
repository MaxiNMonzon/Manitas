import { useState } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import { borrar, listar, type Fila } from '../../api/catalogos'
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import ConfirmarDialog from '../../components/ConfirmarDialog'
import TablaCatalogo from '../../components/admin/TablaCatalogo'
import DetalleFilaDialog from '../../components/admin/DetalleFilaDialog'
import FormularioCatalogoDialog from '../../components/admin/FormularioCatalogoDialog'
import { useOpciones, type Opcion } from '../../components/admin/useOpciones'
import { catalogoPorClave, type Catalogo } from './catalogos'

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Pantalla de un catálogo del administrador: listado con filtro y búsqueda, detalle, alta, edición y baja.
// Cuál catálogo se muestra sale de la URL (/app/catalogos/:clave) y de su configuración en catalogos.ts
export default function CatalogoAdmin() {
  const { clave } = useParams()
  const catalogo = catalogoPorClave(clave)
  if (!catalogo) return <Navigate to="/app" replace />
  // key: al cambiar de catálogo se arranca de cero (filtros, búsqueda, diálogos)
  return <PantallaCatalogo key={catalogo.clave} catalogo={catalogo} />
}

// Esta parte solo coordina: la tabla, el detalle y el formulario están en components/admin
function PantallaCatalogo({ catalogo }: { catalogo: Catalogo }) {
  const theme = useTheme()
  const angosto = useMediaQuery(theme.breakpoints.down('sm'))
  const [idFiltro, setIdFiltro] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState<Fila | null>(null)
  // La versión cambia cada vez que se abre, así el formulario arranca de cero
  const [formulario, setFormulario] = useState<{ fila: Fila | null; version: number } | null>(null)
  const [aBorrar, setABorrar] = useState<Fila | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const filtro = catalogo.filtro
  const opcionesFiltro = useOpciones(filtro?.referencia)
  const filas = useCarga(`catalogo-${catalogo.path}-${idFiltro}`, () =>
    listar(catalogo.path, filtro && idFiltro ? { [filtro.param]: idFiltro } : undefined),
  )

  // La búsqueda mira todas las columnas, sin tildes ni mayúsculas
  const buscado = normalizar(busqueda.trim())
  const visibles = (filas.datos ?? []).filter(
    (f) => !buscado || normalizar(catalogo.columnas.map((c) => c.valor(f)).join(' ')).includes(buscado),
  )
  const titulo = (f: Fila) => catalogo.columnas[0].valor(f)

  const confirmarBorrado = async () => {
    if (!aBorrar) return
    setBorrando(true)
    try {
      await borrar(catalogo.path, Number(aBorrar[catalogo.id]))
      setAviso({ texto: 'Dado de baja.', tipo: 'success' })
      setABorrar(null)
      setDetalle(null)
      filas.recargar()
    } catch (e) {
      setAviso({ texto: e instanceof Error ? e.message : 'No se pudo dar de baja', tipo: 'error' })
    } finally {
      setBorrando(false)
    }
  }

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
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          />
          {filtro && (
            <Autocomplete<Opcion>
              size="small"
              sx={{ minWidth: { md: 300 } }}
              loading={opcionesFiltro.cargando}
              options={opcionesFiltro.opciones}
              value={opcionesFiltro.opciones.find((o) => o.id === idFiltro) ?? null}
              onChange={(_, elegida) => setIdFiltro(elegida?.id ?? null)}
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
      ) : (
        // Al cambiar el filtro o la búsqueda, la lista vuelve a mostrar los primeros 50
        <TablaCatalogo key={`${idFiltro}-${buscado}`} catalogo={catalogo} filas={visibles} angosto={angosto} onElegir={setDetalle} />
      )}

      <DetalleFilaDialog
        catalogo={catalogo}
        fila={detalle}
        angosto={angosto}
        onClose={() => setDetalle(null)}
        onEditar={(f) => setFormulario({ fila: f, version: Date.now() })}
        onBorrar={setABorrar}
      />

      {formulario && (
        <FormularioCatalogoDialog
          key={formulario.version}
          catalogo={catalogo}
          fila={formulario.fila}
          onClose={() => setFormulario(null)}
          onGuardado={(texto) => {
            setFormulario(null)
            setDetalle(null)
            setAviso({ texto, tipo: 'success' })
            filas.recargar()
          }}
        />
      )}

      <ConfirmarDialog
        abierto={aBorrar !== null}
        titulo="¿Dar de baja?"
        texto={aBorrar ? `"${titulo(aBorrar)}" deja de estar disponible. Lo que ya la usa (solicitudes, perfiles) no se modifica.` : ''}
        boton="Dar de baja"
        cargando={borrando}
        onClose={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <AvisoFlotante aviso={aviso} onClose={() => setAviso(null)} duracion={4000} />
    </>
  )
}
