import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import type { SolicitudResumen } from '../../../types'

interface Props {
  // La solicitud a rechazar; con null el diálogo está cerrado
  solicitud: SolicitudResumen | null
  onClose: () => void
  onConfirmar: (s: SolicitudResumen) => void
}

// Confirmar antes de rechazar (no se puede deshacer)
export default function RechazarSolicitudDialog({ solicitud, onClose, onConfirmar }: Props) {
  return (
    <Dialog open={solicitud !== null} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>¿Rechazar la solicitud?</DialogTitle>
      <DialogContent>
        <Typography>
          La solicitud de {solicitud?.cliente?.nombre} queda rechazada y no se puede deshacer. Hacelo si no hacés ese
          trabajo o no podés tomarlo.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Volver</Button>
        <Button variant="contained" color="error" onClick={() => solicitud && onConfirmar(solicitud)}>
          Rechazar
        </Button>
      </DialogActions>
    </Dialog>
  )
}