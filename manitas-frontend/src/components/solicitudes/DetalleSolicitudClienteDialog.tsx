import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import AvatarPersona from '../AvatarPersona'
import { formatoFecha, formatoPesos } from './estados'
import { estadosCliente, estaTerminada, proximoPasoCliente } from './estadosCliente'
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

interface Props {
  solicitud: SolicitudResumen | null
  direccion: string | null
  // En una reprogramación: el horario que se propuso (null mientras se carga o si no hay)
  horarioPropuesto?: Date | null
  onClose: () => void
  // Botones al pie según el estado (aceptar presupuesto, cancelar, calificar...)
  acciones?: ReactNode
}

// Todo sobre una solicitud, visto por el cliente: el profesional, fechas, montos y qué falta
export default function DetalleSolicitudClienteDialog({ solicitud: s, direccion, horarioPropuesto, onClose, acciones }: Props) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))

  // El teléfono del profesional sirve cuando ya confirmó (antes no hay nada que coordinar)
  const confirmada = s !== null && s.estadoServicio !== 'solicitado' && !estaTerminada(s.estadoServicio)
  const telefono = s?.profesional?.telefono?.replace(/\D/g, '').replace(/^0/, '')

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
              {s.profesional ? (
                <AvatarPersona nombre={s.profesional.nombre} apellido={s.profesional.apellido} tamaño={64} />
              ) : (
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.300', color: 'grey.700' }}>
                  <PersonSearchIcon fontSize="large" />
                </Avatar>
              )}
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="h6">
                  {s.profesional ? `${s.profesional.nombre} ${s.profesional.apellido}`.trim() : 'Buscando profesional'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {s.urgente && <Chip size="small" color="error" label="Urgente" />}
                  <Chip size="small" color={estadosCliente[s.estadoServicio].color} label={estadosCliente[s.estadoServicio].label} />
                  {s.fechaPago && <Chip size="small" color="success" variant="outlined" label="Pagado" />}
                </Stack>
              </Stack>
            </Stack>

            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              {proximoPasoCliente(s)}
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

            {confirmada && telefono && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/549${telefono}`}
                target="_blank"
                rel="noopener"
                sx={{ mb: 2 }}
              >
                Escribirle por WhatsApp
              </Button>
            )}

            {s.calificacionServicio != null && (
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Tu calificación</Typography>
                <Rating value={s.calificacionServicio} readOnly />
                {s.reseñaServicio && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    “{s.reseñaServicio}”
                  </Typography>
                )}
              </Stack>
            )}

            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {direccion && <Dato titulo="Dirección">{direccion}</Dato>}
              {s.fechaSolicitud && <Dato titulo="Pedida">{formatoFecha(s.fechaSolicitud)}</Dato>}
              {s.fechaVisita && <Dato titulo="Visita">{formatoFecha(s.fechaVisita)}</Dato>}
              {s.fechaInicio && <Dato titulo="Trabajo">{formatoFecha(s.fechaInicio)}</Dato>}
              {s.fechaFinReal && <Dato titulo="Terminado">{formatoFecha(s.fechaFinReal)}</Dato>}
              {s.costoVisita != null && <Dato titulo="Costo de visita">{formatoPesos(s.costoVisita)}</Dato>}
              {s.estadoServicio === 'presupuestado' && s.costoFinal != null && (
                <Dato titulo="Presupuesto">{formatoPesos(s.costoFinal)}</Dato>
              )}
              {s.costoEstimado != null && s.estadoServicio !== 'presupuestado' && (
                <Dato titulo="Presupuesto aceptado">{formatoPesos(s.costoEstimado)}</Dato>
              )}
              {s.horasTrabajo != null && <Dato titulo="Horas de trabajo">{`${s.horasTrabajo} h`}</Dato>}
              {s.fechaPago && <Dato titulo="Pagado">{formatoFecha(s.fechaPago)}</Dato>}
            </Stack>
          </DialogContent>
          {acciones && <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>{acciones}</DialogActions>}
        </>
      )}
    </Dialog>
  )
}