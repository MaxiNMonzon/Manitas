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
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import dayjs from 'dayjs'
import { crearSolicitud } from '../../api/solicitudes'
import AvatarProfesional from '../profesional/AvatarProfesional'
import SelectorTurno from '../agenda/SelectorTurno'
import { formatoPesos } from './estados'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'

const MAX_DESCRIPCION = 1000

interface Props {
  profesional: ProfesionalResumen | null
  onClose: () => void
  onCreada: (mensaje: string) => void
}

// El cliente le pide presupuesto a un profesional (POST /solicitud-de-servicio): qué necesita,
// de cuál de sus especialidades y el turno de la visita (uno de los libres del profesional).
// El profesional tiene 48 h para confirmarla
export default function SolicitarPresupuestoDialog({ profesional: p, onClose, onCreada }: Props) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))
  const [idEspecialidad, setIdEspecialidad] = useState<number | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [inicio, setInicio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Si hace una sola cosa, ya queda elegida
  const especialidad = p?.oficios.length === 1 ? p.oficios[0].idEspecialidad : idEspecialidad
  const listo = !!especialidad && descripcion.trim().length >= 5 && inicio !== null

  const cerrar = () => {
    setIdEspecialidad('')
    setDescripcion('')
    setInicio(null)
    setError(null)
    onClose()
  }

  const enviar = async () => {
    if (!p || !listo) return
    setEnviando(true)
    setError(null)
    try {
      await crearSolicitud(
        { idProfesional: p.idUsuario, idEspecialidad: Number(especialidad), descripcionProblema: descripcion.trim(), inicioTurno: new Date(inicio!) },
        {
          profesional: { idUsuario: p.idUsuario, nombre: p.nombre, apellido: p.apellido, telefono: '' },
          especialidad: p.oficios.find((o) => o.idEspecialidad === Number(especialidad))?.nombre ?? '',
          costoVisita: p.costoVisita,
        },
      )
      const cuando = dayjs(inicio).format('dddd DD/MM [a las] HH:mm')
      // Igual que el back: tiene 48 h para responder, o hasta la hora del turno si llega antes
      const en48hs = dayjs().add(48, 'hour')
      const limite = dayjs(inicio).isBefore(en48hs) ? dayjs(inicio) : en48hs
      cerrar()
      onCreada(
        `Solicitud enviada a ${p.nombre}. Visita pedida para el ${cuando}. ` +
          `Tiene tiempo de responder hasta el ${limite.format('dddd DD/MM [a las] HH:mm')}: te avisamos cuando confirme.`,
      )
    } catch (e) {
      // Ej: "El turno ya no esta libre"
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={p !== null} onClose={cerrar} fullWidth maxWidth="sm" fullScreen={pantallaChica}>
      <DialogTitle>Solicitar turno</DialogTitle>
      <DialogContent dividers>
        {p && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <AvatarProfesional profesional={p} tamaño={48} />
              <div>
                <Typography sx={{ fontWeight: 600 }}>
                  {p.nombre} {p.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.costoVisita ? `Visita: ${formatoPesos(p.costoVisita)}` : 'Visita sin cargo'} · Presupuesto a confirmar
                </Typography>
              </div>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {p.oficios.length > 1 && (
              <TextField
                select
                label="¿Qué necesitás?"
                value={idEspecialidad}
                onChange={(e) => setIdEspecialidad(Number(e.target.value))}
              >
                {p.oficios.map((o) => (
                  <MenuItem key={o.idEspecialidad} value={o.idEspecialidad}>
                    {o.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Contanos tu problema"
              placeholder="Ej: gotea la canilla de la cocina y hace ruido"
              multiline
              minRows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
              helperText={`${descripcion.length}/${MAX_DESCRIPCION}`}
            />

            <div>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Elegí el día y la hora de la visita
              </Typography>
              <SelectorTurno idProfesional={p.idUsuario} valor={inicio} onChange={setInicio} etiquetaHora="Hora de la visita" />
            </div>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button variant="contained" onClick={enviar} disabled={!listo} loading={enviando}>
          Enviar solicitud
        </Button>
      </DialogActions>
    </Dialog>
  )
}