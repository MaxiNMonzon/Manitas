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
import BoltIcon from '@mui/icons-material/Bolt'
import { crearUrgente } from '../../api/solicitudes'
import type { Categoria } from '../../mocks/inicioCliente'

const MAX_DESCRIPCION = 1000

interface Props {
  abierto: boolean
  especialidades: Categoria[]
  // Si se abre desde una categoría, ya viene elegida
  idEspecialidadInicial?: number | null
  onClose: () => void
  onCreada: (mensaje: string) => void
}

// Pedir un servicio urgente (POST /solicitud-de-servicio/urgente): sin elegir profesional ni turno.
// Le aparece a todos los de esa especialidad en la zona del cliente; el primero que acepta
// dice en cuánto llega. Si nadie la toma en 1 hora, vence
export default function UrgenteDialog({ abierto, especialidades, idEspecialidadInicial, onClose, onCreada }: Props) {
  const [idEspecialidad, setIdEspecialidad] = useState<number | ''>(idEspecialidadInicial ?? '')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setIdEspecialidad('')
    setDescripcion('')
    setError(null)
    onClose()
  }

  const enviar = async () => {
    if (!idEspecialidad) return
    setEnviando(true)
    setError(null)
    try {
      const nombre = especialidades.find((e) => e.idEspecialidad === idEspecialidad)?.nombre ?? ''
      await crearUrgente(idEspecialidad, descripcion.trim(), nombre)
      cerrar()
      onCreada('Urgencia enviada a los profesionales de tu zona. Te avisamos apenas uno la tome y cuándo llega.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo pedir la urgencia')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BoltIcon color="error" /> Pedir urgencia
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Le llega a todos los profesionales de esa especialidad en tu zona. El primero que la toma te dice a qué hora
          llega. Si nadie la toma en 1 hora, se cancela sola.
        </Typography>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="¿Qué necesitás?" value={idEspecialidad} onChange={(e) => setIdEspecialidad(Number(e.target.value))}>
            {especialidades.map((e) => (
              <MenuItem key={e.idEspecialidad} value={e.idEspecialidad}>
                {e.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="¿Qué pasó?"
            placeholder="Ej: se rompió un caño y sale mucha agua"
            multiline
            minRows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={enviar}
          disabled={!idEspecialidad || descripcion.trim().length < 5}
          loading={enviando}
        >
          Pedir ahora
        </Button>
      </DialogActions>
    </Dialog>
  )
}