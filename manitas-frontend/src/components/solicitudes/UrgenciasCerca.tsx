import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { UrgenteDisponible } from '../../types'

interface Props {
  urgentes: UrgenteDisponible[]
  onTomar: (u: UrgenteDisponible) => void
  sx?: object
}

// Urgencias de las especialidades y zonas del profesional que nadie tomó todavía
// (GET /solicitud-de-servicio/urgentes). La primera que acepta se la queda. Si no hay, no muestra nada
export default function UrgenciasCerca({ urgentes, onTomar, sx }: Props) {
  if (urgentes.length === 0) return null
  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderColor: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.06), ...sx }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'error.main', mb: 2 }}>
        <WarningAmberIcon />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Urgencias cerca tuyo
        </Typography>
        <Chip size="small" color="error" label={urgentes.length} />
      </Stack>
      <Stack spacing={1.5}>
        {urgentes.map((u) => (
          <Paper key={u.idSolicitud} variant="outlined" sx={{ p: 2, borderLeft: 5, borderLeftColor: 'error.main' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {u.especialidad} · {u.zona}
                  </Typography>
                  <Chip size="small" color="error" variant="outlined" label={`Quedan ${u.minutosQueQuedan} min`} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {u.cliente}: {u.descripcionProblema}
                </Typography>
              </Box>
              <Button variant="contained" color="error" onClick={() => onTomar(u)} sx={{ flexShrink: 0 }}>
                Aceptar
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
