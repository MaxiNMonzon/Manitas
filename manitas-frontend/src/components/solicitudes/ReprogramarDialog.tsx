import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import SelectorTurno from '../agenda/SelectorTurno'
import { formatoFecha } from './estados'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitud: SolicitudResumen | null
  // De quién son los turnos (el profesional de la solicitud)
  idProfesional: number | null
  // Le toca contestar a la otra persona
  conQuien: string
  onClose: () => void
  enviar: (inicio: Date) => Promise<void>
  onEnviado: () => void
}

// Proponer otro horario para la visita o el trabajo: se elige otro turno libre del profesional.
// Queda en "reprogramación" hasta que el otro acepte (o rechace y sigue el horario de antes)
export default function ReprogramarDialog({ solicitud: s, idProfesional, conQuien, onClose, enviar, onEnviado }: Props) {
  const [inicio, setInicio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const base = s?.estadoServicio === 'reprogramacion' ? s.estadoAnterior : s?.estadoServicio
  const esTrabajo = base === 'contratado'
  const actual = esTrabajo ? s?.fechaInicio : s?.fechaVisita

  const cerrar = () => {
    setInicio(null)
    setError(null)
    onClose()
  }

  const confirmar = async () => {
    if (!inicio) return
    setEnviando(true)
    setError(null)
    try {
      await enviar(new Date(inicio))
      cerrar()
      onEnviado()
    } catch (e) {
      // Ej: "El horario esta tomado" o "Solo se puede reprogramar hasta 12 hs antes"
      setError(e instanceof Error ? e.message : 'No se pudo proponer el horario')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={s !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>{esTrabajo ? 'Cambiar el horario del trabajo' : 'Cambiar el horario de la visita'}</DialogTitle>
      <DialogContent>
        {s && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {s.descripcionProblema}
            {actual && (
              <>
                <br />
                Ahora: <strong>{formatoFecha(actual)}</strong>
              </>
            )}
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {s && (
          <SelectorTurno
            idProfesional={idProfesional}
            valor={inicio}
            onChange={setInicio}
            etiquetaHora={esTrabajo ? 'Nueva hora de inicio' : 'Nueva hora'}
            desde={dayjs()}
          />
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Le avisamos a {conQuien}. Hasta que acepte, sigue valiendo el horario de antes.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Volver</Button>
        <Button variant="contained" onClick={confirmar} disabled={!inicio} loading={enviando}>
          Proponer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
