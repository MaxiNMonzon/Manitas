import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { presupuestar } from '../../api/solicitudes'
import type { SolicitudResumen } from '../../types'

// Las horas se eligen de una lista: la agenda trabaja con turnos de 1 hora, así que van enteras.
// Hasta 7 h una por una; después, en jornadas de 8 h (el back acepta hasta 200)
const OPCIONES_HORAS: { horas: number; texto: string }[] = [
  ...[1, 2, 3, 4, 5, 6, 7].map((h) => ({ horas: h, texto: h === 1 ? '1 hora' : `${h} horas` })),
  ...[1, 2, 3, 4, 5, 10, 15, 20, 25].map((dias) => ({
    horas: dias * 8,
    texto: `${dias * 8} horas (${dias === 1 ? '1 jornada' : `${dias} jornadas`})`,
  })),
]

interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  onEnviado: () => void
}

// Después de la visita, el profesional carga el precio del trabajo y cuántas horas lleva
// (PATCH /:id/presupuestar). Con las horas, el cliente elige desde qué turno libre arranca y se
// reservan esas horas seguidas. En un trabajo ya contratado es un cambio de precio: solo el monto
export default function PresupuestarDialog({ solicitud, onClose, onEnviado }: Props) {
  const [monto, setMonto] = useState('')
  const [horas, setHoras] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cambioDePrecio = solicitud?.estadoServicio === 'contratado'
  const horasValidas = horas !== ''
  const listo = Number(monto) > 0 && (cambioDePrecio || horasValidas)

  const cerrar = () => {
    setMonto('')
    setHoras('')
    setError(null)
    onClose()
  }

  const enviar = async () => {
    if (!solicitud || !listo) return
    setEnviando(true)
    setError(null)
    try {
      await presupuestar(solicitud.idSolicitud, Number(monto), cambioDePrecio ? undefined : Number(horas))
      cerrar()
      onEnviado()
    } catch (e) {
      // Ej: "Todavia no fue la visita: el presupuesto se pasa despues de ver el problema"
      setError(e instanceof Error ? e.message : 'No se pudo enviar el presupuesto')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={solicitud !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>{cambioDePrecio ? 'Cambiar el precio' : 'Enviar presupuesto'}</DialogTitle>
      <DialogContent>
        {solicitud && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {solicitud.cliente ? `${solicitud.cliente.nombre} · ` : ''}
            {solicitud.descripcionProblema}
          </Typography>
        )}
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label={cambioDePrecio ? 'Precio nuevo del trabajo' : 'Precio del trabajo'}
            value={monto}
            onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))}
            slotProps={{
              htmlInput: { inputMode: 'numeric' },
              input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
            }}
          />
          {!cambioDePrecio && (
            <TextField
              select
              fullWidth
              label="¿Cuánto tiempo lleva?"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              helperText="Se reservan esas horas seguidas en tu agenda (una jornada = 8 h). Si es 1 hora, el cliente puede pedir que lo hagas en el momento"
            >
              {OPCIONES_HORAS.map((o) => (
                <MenuItem key={o.horas} value={String(o.horas)}>
                  {o.texto}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Typography variant="body2" color="text.secondary">
            {cambioDePrecio
              ? 'El cliente lo tiene que volver a aceptar; el horario del trabajo no cambia.'
              : 'El cliente lo acepta o lo rechaza desde su cuenta.'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button variant="contained" onClick={enviar} disabled={!listo} loading={enviando}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  )
}