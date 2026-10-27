import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import DirectionsIcon from '@mui/icons-material/Directions'
import AvatarPersona from '../AvatarPersona'
import { direccionDe, estados, formatoFecha, formatoPesos, proximoPaso } from './estados'
import type { SolicitudResumen } from '../../types'

function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {titulo}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', '&::first-letter': { textTransform: 'uppercase' } }}>
        {children}
      </Typography>
    </Stack>
  )
}

// Todo sobre una solicitud: cliente, contacto, dirección, fechas y montos
interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  // Botones al pie (ej: Aceptar / Rechazar en una solicitud nueva)
  acciones?: ReactNode
  // En una reprogramación: el horario que se propuso
  horarioPropuesto?: Date | null
}

export default function DetalleSolicitudDialog({ solicitud: s, onClose, acciones, horarioPropuesto }: Props) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))

  const aceptada = s !== null && s.estadoServicio !== 'solicitado'
  const lugar = s ? direccionDe(s.cliente, s.estadoServicio) : null
  const telefono = s?.cliente?.telefono.replace(/\D/g, '').replace(/^0/, '')

  return (
    <Dialog open={s !== null} onClose={onClose} fullWidth maxWidth="sm" fullScreen={pantallaChica}>
      {s && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            Solicitud #{s.idSolicitud}
            <IconButton aria-label="Cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <AvatarPersona nombre={s.cliente?.nombre ?? '?'} apellido={s.cliente?.apellido} tamaño={64} />
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="h6">{s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}`.trim() : 'Cliente'}</Typography>
                <Stack direction="row" spacing={1}>
                  {s.urgente && <Chip size="small" color="error" label="Urgente" />}
                  <Chip size="small" color={estados[s.estadoServicio].color} label={estados[s.estadoServicio].label} />
                </Stack>
              </Stack>
            </Stack>

            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              {proximoPaso(s)}
            </Alert>

            {s.estadoServicio === 'reprogramacion' && horarioPropuesto && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Horario propuesto: <strong>{formatoFecha(horarioPropuesto.toISOString())}</strong>
              </Alert>
            )}

            <Typography variant="subtitle2" gutterBottom>
              {s.especialidad?.nombreEspecialidad ?? 'Problema'}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>{s.descripcionProblema}</Typography>

            {aceptada ? (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
                {telefono && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/549${telefono}`}
                    target="_blank"
                    rel="noopener"
                  >
                    WhatsApp
                  </Button>
                )}
                {lugar && (
                  <Button
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`}
                    target="_blank"
                    rel="noopener"
                  >
                    Cómo llegar
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El teléfono y la dirección se ven cuando aceptás la solicitud.
              </Typography>
            )}

            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {lugar && <Dato titulo={aceptada ? 'Dirección' : 'Zona'}>{lugar}</Dato>}
              {s.fechaSolicitud && <Dato titulo="Pedida">{formatoFecha(s.fechaSolicitud)}</Dato>}
              {s.fechaVisita && <Dato titulo="Visita">{formatoFecha(s.fechaVisita)}</Dato>}
              {s.fechaInicio && <Dato titulo="Trabajo">{formatoFecha(s.fechaInicio)}</Dato>}
              {s.fechaFinReal && <Dato titulo="Terminado">{formatoFecha(s.fechaFinReal)}</Dato>}
              {s.horasTrabajo != null && <Dato titulo="Horas de trabajo">{`${s.horasTrabajo} h`}</Dato>}
              {s.fechaPago && <Dato titulo="Pagado">{formatoFecha(s.fechaPago)}</Dato>}
              {s.costoVisita != null && <Dato titulo="Costo de visita">{formatoPesos(s.costoVisita)}</Dato>}
              {s.costoEstimado != null && <Dato titulo="Presupuesto aceptado">{formatoPesos(s.costoEstimado)}</Dato>}
              {s.costoFinal != null && <Dato titulo="A cobrar / cobrado">{formatoPesos(s.costoFinal)}</Dato>}
            </Stack>
          </DialogContent>
          {acciones && <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{acciones}</DialogActions>}
        </>
      )}
    </Dialog>
  )
}