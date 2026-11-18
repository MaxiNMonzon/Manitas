import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import BoltIcon from '@mui/icons-material/Bolt'
import { buscarProfesionales, traerEspecialidades } from '../../api/profesionales'
import { traerUbicacionCliente } from '../../api/perfil'
import { useCarga } from '../../hooks/useCarga'
import { useDiferido } from '../../hooks/useDiferido'
import TarjetaProfesional from '../../components/profesional/TarjetaProfesional'
import PerfilProfesionalDialog from '../../components/profesional/PerfilProfesionalDialog'
import SolicitarPresupuestoDialog from '../../components/solicitudes/SolicitarPresupuestoDialog'
import UrgenteDialog from '../../components/solicitudes/UrgenteDialog'
import type { ProfesionalResumen } from '../../types'

// Buscador de profesionales del cliente (/app/profesionales?q=&especialidad=). Todos los filtros
// (especialidad, zona y texto) los aplica el back: acá solo llegan los que coinciden.
// Desde el perfil se pide el presupuesto
export default function Profesionales() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  // Lo que se va escribiendo vive acá; a la URL (y al back) llega cuando deja de escribir.
  // Si el campo leyera directo de la URL, al escribir rápido se perdían letras
  const [texto, setTexto] = useState(() => params.get('q') ?? '')
  const idEspecialidad = Number(params.get('especialidad')) || null
  const [perfil, setPerfil] = useState<ProfesionalResumen | null>(null)
  const [aSolicitar, setASolicitar] = useState<ProfesionalResumen | null>(null)
  const [urgenteAbierto, setUrgenteAbierto] = useState(false)

  const especialidades = useCarga('especialidades', traerEspecialidades)
  const ubicacion = useCarga('ubicacion-cliente', traerUbicacionCliente)
  // Siempre los de la zona del cliente: la visita es en su casa
  const idZona = ubicacion.datos?.idZona ?? null
  // Se busca cuando deja de escribir (no una vez por letra)
  const textoBuscado = useDiferido(texto.trim())
  const profesionales = useCarga(`profesionales-${idEspecialidad}-${idZona}-${textoBuscado}-${ubicacion.cargando}`, () =>
    // Se espera a saber la zona del cliente para no buscar dos veces
    ubicacion.cargando ? Promise.resolve([]) : buscarProfesionales({ idEspecialidad, idZona, texto: textoBuscado }),
  )

  // Guarda un filtro en la URL (así la búsqueda se puede compartir y sobrevive a recargar la página)
  const cambiarFiltro = useCallback(
    (clave: string, valor: string) =>
      setParams(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales)
          if (valor) nuevos.set(clave, valor)
          else nuevos.delete(clave)
          return nuevos
        },
        { replace: true },
      ),
    [setParams],
  )

  // El texto buscado pasa a la URL recién cuando deja de escribir
  useEffect(() => cambiarFiltro('q', textoBuscado), [cambiarFiltro, textoBuscado])

  const lista = profesionales.datos ?? []
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
              onChange={(e) => setTexto(e.target.value)}
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
          <Grid size={{ xs: 12, md: 6 }}>
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
            No encontramos profesionales con esos filtros
            {ubicacion.datos?.nombreZona ? ` que trabajen en tu zona (${ubicacion.datos.nombreZona})` : ''}.
          </Typography>
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
