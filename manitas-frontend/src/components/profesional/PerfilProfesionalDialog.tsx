import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import PlaceIcon from '@mui/icons-material/Place'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import dayjs from 'dayjs'
import { traerCalificaciones } from '../../api/profesionales'
import { useCarga } from '../../hooks/useCarga'
import { formatoPesos } from '../solicitudes/estados'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'
import AvatarProfesional from './AvatarProfesional'

const RESEÑAS_VISIBLES = 5

// Ventana flotante con el perfil del profesional (en celular ocupa toda la pantalla):
// datos, sobre mí, reseñas de otros clientes y el botón para pedirle presupuesto
export default function PerfilProfesionalDialog({
  profesional,
  onClose,
  onSolicitar,
}: {
  profesional: ProfesionalResumen | null
  onClose: () => void
  onSolicitar?: (profesional: ProfesionalResumen) => void
}) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))
  const id = profesional?.idUsuario ?? null
  const calificaciones = useCarga(`calificaciones-${id}`, () => (id ? traerCalificaciones(id) : Promise.resolve(null)))
  const reseñas = (calificaciones.datos?.reseñas ?? []).filter((r) => r.reseña)

  return (
    <Dialog open={profesional !== null} onClose={onClose} fullWidth maxWidth="sm" fullScreen={pantallaChica}>
      {profesional && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            Perfil del profesional
            <IconButton aria-label="Cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <AvatarProfesional profesional={profesional} tamaño={96} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profesional.nombre} {profesional.apellido}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Rating value={profesional.calificacion} precision={0.5} readOnly />
                <Typography color="text.secondary">
                  {profesional.cantidadCalificaciones > 0
                    ? `${profesional.calificacion.toFixed(1)} · ${profesional.cantidadCalificaciones} calificaciones`
                    : 'Todavía sin calificaciones'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                {profesional.especialidades.map((e) => (
                  <Chip key={e} label={e} color="primary" variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <PlaceIcon fontSize="small" />
                <Typography>{profesional.zona}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {profesional.costoVisita ? `Visita: ${formatoPesos(profesional.costoVisita)}` : 'Visita sin cargo'}
              </Typography>
            </Stack>

            {profesional.descripcion && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 3, mb: 0.5 }}>
                  Sobre mí y mi trabajo
                </Typography>
                {/* Se muestra como texto (no HTML), respetando los saltos de línea */}
                <Typography sx={{ whiteSpace: 'pre-line' }}>{profesional.descripcion}</Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Lo que dicen sus clientes
            </Typography>
            {calificaciones.cargando ? (
              <Skeleton variant="rounded" height={60} />
            ) : reseñas.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Todavía no tiene reseñas.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {reseñas.slice(0, RESEÑAS_VISIBLES).map((r, i) => (
                  <Box key={i}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Rating value={r.calificacion} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {r.cliente}
                        {r.fecha ? ` · ${dayjs(r.fecha).format('DD/MM/YYYY')}` : ''}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{r.reseña}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
          {onSolicitar && (
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                fullWidth={pantallaChica}
                variant="contained"
                size="large"
                startIcon={<EventAvailableIcon />}
                onClick={() => onSolicitar(profesional)}
              >
                Pedir turno
              </Button>
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  )
}
