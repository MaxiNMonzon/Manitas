import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import dayjs from 'dayjs'

// Lo que se ve de la urgente antes de tomarla
export interface UrgenteAAceptar {
  idSolicitud: number
  cliente: string
  descripcionProblema: string
}

interface Props {
  urgente: UrgenteAAceptar | null
  cargando: boolean
  onClose: () => void
  onConfirmar: (minutos: number) => void
}

const OPCIONES = [15, 30, 45, 60, 90, 120]

// Una urgente no se agenda (es en el día): antes de aceptarla, el profesional dice en cuánto llega
// y con eso se le avisa al cliente
export default function TiempoLlegadaDialog({ urgente, cargando, onClose, onConfirmar }: Props) {
  return (
    <Dialog open={urgente !== null} onClose={cargando ? undefined : onClose} maxWidth="xs" fullWidth>
      {/* El contenido se arma de nuevo cada vez que se abre (así arranca en 30 min y con la hora actual) */}
      {urgente && <Contenido urgente={urgente} cargando={cargando} onClose={onClose} onConfirmar={onConfirmar} />}
    </Dialog>
  )
}

function Contenido({ urgente, cargando, onClose, onConfirmar }: Props & { urgente: UrgenteAAceptar }) {
  const [minutos, setMinutos] = useState(30)
  const [ahora] = useState(() => Date.now())
  const llegada = dayjs(ahora).add(minutos, 'minute').format('HH:mm')

  return (
    <>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <DirectionsRunIcon />
        ¿En cuánto llegás?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {urgente.cliente}: {urgente.descripcionProblema}
          </Typography>
          <ToggleButtonGroup
            value={minutos}
            exclusive
            color="error"
            onChange={(_, valor: number | null) => valor && setMinutos(valor)}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {OPCIONES.map((m) => (
              <ToggleButton key={m} value={m} sx={{ fontWeight: 600 }}>
                {m < 60 ? `${m} min` : m === 60 ? '1 h' : `${m / 60} h`.replace('.5', ' ½')}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Alert severity="info" icon={false}>
            Llegarías alrededor de las <strong>{llegada}</strong>. Le avisamos al cliente apenas aceptes.
          </Alert>
          <Typography variant="caption" color="text.secondary">
            Las urgentes son en el día: no se agendan ni se reprograman. Si otro profesional la acepta antes, se te avisa.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={cargando}>
          Volver
        </Button>
        <Button variant="contained" color="error" loading={cargando} onClick={() => onConfirmar(minutos)}>
          Aceptar y avisar
        </Button>
      </DialogActions>
    </>
  )
}
