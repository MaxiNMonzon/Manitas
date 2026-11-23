import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { formatoFecha, tiempoQueQueda } from './estados'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitudes: SolicitudResumen[]
  onResponder: (solicitud: SolicitudResumen) => void
}

// Las solicitudes nuevas que el profesional tiene que responder (como las urgencias, pero en azul).
// Si no hay, no muestra nada
export default function SolicitudesNuevas({ solicitudes, onResponder }: Props) {
  if (solicitudes.length === 0) return null
  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderColor: 'primary.main', bgcolor: (tema) => alpha(tema.palette.primary.main, 0.06) }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main', mb: 2 }}>
        <NotificationsActiveIcon />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Solicitudes nuevas
        </Typography>
        <Chip size="small" color="primary" label={solicitudes.length} />
      </Stack>
      <Stack spacing={1.5}>
        {solicitudes.map((solicitud) => (
          <Paper key={solicitud.idSolicitud} variant="outlined" sx={{ p: 2, borderLeft: 5, borderLeftColor: 'primary.main' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {solicitud.cliente ? `${solicitud.cliente.nombre} ${solicitud.cliente.apellido}` : 'Cliente'}
                  {solicitud.especialidad && (
                    <Typography component="span" color="text.secondary">
                      {' '}
                      · {solicitud.especialidad.nombreEspecialidad}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {solicitud.descripcionProblema}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {solicitud.fechaVisita ? `Pedido de visita para el ${formatoFecha(solicitud.fechaVisita)} · ` : ''}
                  quedan {tiempoQueQueda(solicitud)} para responder
                </Typography>
              </Box>
              <Button variant="contained" color="primary" onClick={() => onResponder(solicitud)} sx={{ flexShrink: 0 }}>
                Responder
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
