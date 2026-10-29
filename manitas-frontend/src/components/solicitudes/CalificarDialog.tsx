import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { calificarServicio } from '../../api/solicitudes'
import AvatarPersona from '../AvatarPersona'
import type { SolicitudResumen } from '../../types'

const etiquetas: Record<number, string> = { 1: 'Malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' }
const MAX_RESEÑA = 500

interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  onCalificado: () => void
}

// Calificar al profesional de una solicitud finalizada (PATCH /:id/calificar, una sola vez)
export default function CalificarDialog({ solicitud: s, onClose, onCalificado }: Props) {
  const [estrellas, setEstrellas] = useState<number | null>(null)
  const [hover, setHover] = useState(-1)
  const [reseña, setReseña] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setEstrellas(null)
    setReseña('')
    setError(null)
    onClose()
  }

  const enviar = async () => {
    if (!s || !estrellas) return
    setEnviando(true)
    setError(null)
    try {
      await calificarServicio(s.idSolicitud, estrellas, reseña)
      cerrar()
      onCalificado()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo calificar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={s !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>Calificar al profesional</DialogTitle>
      <DialogContent>
        {s?.profesional && (
          <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', mb: 2 }}>
            <AvatarPersona nombre={s.profesional.nombre} apellido={s.profesional.apellido} tamaño={64} />
            <Typography variant="h6">
              {s.profesional.nombre} {s.profesional.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {s.descripcionProblema}
            </Typography>
          </Stack>
        )}
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Rating
            size="large"
            value={estrellas}
            onChange={(_, valor) => setEstrellas(valor)}
            onChangeActive={(_, valor) => setHover(valor)}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 20 }}>
            {etiquetas[hover !== -1 ? hover : (estrellas ?? 0)] ?? '¿Cómo fue el trabajo?'}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reseña (opcional)"
            placeholder="Ej: muy prolijo y llegó puntual"
            value={reseña}
            onChange={(e) => setReseña(e.target.value.slice(0, MAX_RESEÑA))}
            helperText={`${reseña.length}/${MAX_RESEÑA}`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Más tarde</Button>
        <Button variant="contained" onClick={enviar} disabled={!estrellas} loading={enviando}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
