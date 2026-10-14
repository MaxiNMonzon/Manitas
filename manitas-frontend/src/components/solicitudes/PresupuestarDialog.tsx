import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { presupuestar } from '../../api/solicitudes'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  onEnviado: () => void
}

// Después de la visita, el profesional carga el precio del trabajo (PATCH /:id/presupuestar)
export default function PresupuestarDialog({ solicitud, onClose, onEnviado }: Props) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setMonto('')
    setError(null)
    onClose()
  }

  const enviar = async () => {
    if (!solicitud) return
    setEnviando(true)
    setError(null)
    try {
      await presupuestar(solicitud.idSolicitud, Number(monto))
      cerrar()
      onEnviado()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el presupuesto')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={solicitud !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>Enviar presupuesto</DialogTitle>
      <DialogContent>
        {solicitud && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {solicitud.cliente ? `${solicitud.cliente.nombre} · ` : ''}
            {solicitud.descripcionProblema}
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Precio del trabajo"
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))}
          helperText="El cliente lo acepta o lo rechaza desde su cuenta"
          slotProps={{
            htmlInput: { inputMode: 'numeric' },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button variant="contained" onClick={enviar} disabled={!Number(monto)} loading={enviando}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
