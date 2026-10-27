import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import BoltIcon from '@mui/icons-material/Bolt'
import { buscarProfesionales, traerEspecialidades } from '../../api/profesionales'
import { traerUbicacionCliente } from '../../api/perfil'
import { useCarga } from '../../hooks/useCarga'
import TarjetaProfesional from '../../components/profesional/TarjetaProfesional'
import PerfilProfesionalDialog from '../../components/profesional/PerfilProfesionalDialog'
import SolicitarPresupuestoDialog from '../../components/solicitudes/SolicitarPresupuestoDialog'
import UrgenteDialog from '../../components/solicitudes/UrgenteDialog'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'

// Sin tildes ni mayúsculas, para que "plomeria" encuentre "Plomería"
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Buscador de profesionales del cliente (/app/profesionales?q=&especialidad=): filtra por especialidad
// y zona en el back y por texto acá. Desde el perfil se pide el presupuesto
export default function Profesionales() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const texto = params.get('q') ?? ''
  const idEspecialidad = Number(params.get('especialidad')) || null
  const [soloMiZona, setSoloMiZona] = useState(true)
  const [perfil, setPerfil] = useState<ProfesionalResumen | null>(null)
  const [aSolicitar, setASolicitar] = useState<ProfesionalResumen | null>(null)
  const [urgenteAbierto, setUrgenteAbierto] = useState(false)

  const especialidades = useCarga('especialidades', traerEspecialidades)
  const ubicacion = useCarga('ubicacion-cliente', traerUbicacionCliente)
  const idZona = soloMiZona ? (ubicacion.datos?.idZona ?? null) : null
  const profesionales = useCarga(`profesionales-${idEspecialidad}-${idZona}-${ubicacion.cargando}`, () =>
    // Se espera a saber la zona del cliente para no buscar dos veces
    ubicacion.cargando ? Promise.resolve([]) : buscarProfesionales({ idEspecialidad, idZona }),
  )

  const cambiarFiltro = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(params)
    if (valor) nuevos.set(clave, valor)
    else nuevos.delete(clave)
    setParams(nuevos, { replace: true })
  }

  const buscado = normalizar(texto.trim())
  const lista = (profesionales.datos ?? []).filter(
    (p) => !buscado || normalizar(`${p.nombre} ${p.apellido} ${p.especialidades.join(' ')} ${p.descripcion}`).includes(buscado),
  )
  const cargando = profesionales.cargando || ubicacion.cargando
  const error = profesionales.error ?? especialidades.error

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Profesionales
        </Typography>
        <Button variant="outlined" color="error" startIcon={<BoltIcon />} onClick={() => setUrgenteAbierto(true)}>
          Es urgente
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, oficio o problema"
              value={texto}
              onChange={(e) => cambiarFiltro('q', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Especialidad"
              value={idEspecialidad ?? ''}
              onChange={(e) => cambiarFiltro('especialidad', String(e.target.value))}
            >
              <MenuItem value="">Todas</MenuItem>
              {(especialidades.datos ?? []).map((e) => (
                <MenuItem key={e.idEspecialidad} value={e.idEspecialidad}>
                  {e.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              control={<Switch checked={soloMiZona} onChange={(e) => setSoloMiZona(e.target.checked)} />}
              label={ubicacion.datos?.nombreZona ? `Solo en ${ubicacion.datos.nombreZona}` : 'Solo en mi zona'}
              disabled={!ubicacion.datos?.idZona}
            />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <Grid container spacing={2}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={170} />
            </Grid>
          ))}
        </Grid>
      ) : lista.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No encontramos profesionales con esos filtros.
          </Typography>
          {soloMiZona && ubicacion.datos?.idZona && <Button onClick={() => setSoloMiZona(false)}>Buscar en todas las zonas</Button>}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {lista.map((p) => (
            <Grid key={p.idUsuario} size={{ xs: 12, sm: 6, md: 4 }}>
              <TarjetaProfesional profesional={p} onVerPerfil={() => setPerfil(p)} />
            </Grid>
          ))}
        </Grid>
      )}

      <PerfilProfesionalDialog
        profesional={perfil}
        onClose={() => setPerfil(null)}
        onSolicitar={(p) => {
          setPerfil(null)
          setASolicitar(p)
        }}
      />
      <SolicitarPresupuestoDialog
        profesional={aSolicitar}
        onClose={() => setASolicitar(null)}
        onCreada={(mensaje) => navigate('/app/solicitudes', { state: { mensaje } })}
      />
      <UrgenteDialog
        key={String(urgenteAbierto)}
        abierto={urgenteAbierto}
        especialidades={especialidades.datos ?? []}
        idEspecialidadInicial={idEspecialidad}
        onClose={() => setUrgenteAbierto(false)}
        onCreada={(mensaje) => navigate('/app/solicitudes', { state: { mensaje } })}
      />
    </>
  )
}