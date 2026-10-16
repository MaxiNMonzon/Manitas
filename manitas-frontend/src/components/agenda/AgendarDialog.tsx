import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { agendar } from '../../api/solicitudes'
import type { SolicitudResumen } from '../../types'

const duraciones = [
  { minutos: 30, label: '30 minutos' },
  { minutos: 60, label: '1 hora' },
  { minutos: 90, label: '1 hora y media' },
  { minutos: 120, label: '2 horas' },
  { minutos: 180, label: '3 horas' },
  { minutos: 240, label: '4 horas' },
  { minutos: 480, label: 'Jornada completa (8 h)' },
  { minutos: 1440, label: '1 día entero' },
  { minutos: 2880, label: '2 días' },
  { minutos: 4320, label: '3 días' },
]

interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  onAgendado: () => void
}

// Cargar la fecha, hora y duración acordadas con el cliente (PATCH /:id/agendar)
export default function AgendarDialog({ solicitud, onClose, onAgendado }: Props) {
  const esTrabajo = solicitud?.costoEstimado != null
  const [dia, setDia] = useState<Dayjs | null>(null)
  const [hora, setHora] = useState<Dayjs | null>(null)
  const [duracion, setDuracion] = useState(60)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setDia(null)
    setHora(null)
    setDuracion(60)
    setError(null)
    onClose()
  }

  const guardar = async () => {
    if (!solicitud || !dia || !hora) return
    const fecha = dia.hour(hora.hour()).minute(hora.minute()).second(0).millisecond(0)
    if (fecha.isBefore(dayjs())) {
      setError('La fecha tiene que ser en el futuro')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await agendar(solicitud.idSolicitud, fecha.toDate(), duracion)
      cerrar()
      onAgendado()
    } catch (e) {
      // Ej: "Se pisa con la visita de Sofía (15/10 10:00 a 15/10 11:00)"
      setError(e instanceof Error ? e.message : 'No se pudo agendar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={solicitud !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>{esTrabajo ? 'Agendar el trabajo' : 'Agendar la visita'}</DialogTitle>
      <DialogContent>
        {solicitud && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {solicitud.cliente ? `${solicitud.cliente.nombre} ${solicitud.cliente.apellido} · ` : ''}
            {solicitud.descripcionProblema}
          </Typography>
        )}
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <DatePicker label="Día" value={dia} onChange={setDia} disablePast />
          <TimePicker label="Hora" value={hora} onChange={setHora} ampm={false} minutesStep={15} />
          <TextField
            select
            label="Duración estimada"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
            helperText="Para tu calendario y para que no se te pisen dos visitas"
          >
            {duraciones.map((d) => (
              <MenuItem key={d.minutos} value={d.minutos}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button variant="contained" onClick={guardar} disabled={!dia || !hora} loading={enviando}>
          Agendar
        </Button>
      </DialogActions>
    </Dialog>
  )
}