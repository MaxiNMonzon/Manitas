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
import { formatoFecha } from './estados'
import { formatoPesos } from '../../dinero'
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
export default function DetalleSolicitudClienteDialog({ solicitud, direccion, horarioPropuesto, onClose, acciones }: Props) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))

  // El teléfono del profesional sirve cuando ya confirmó (antes no hay nada que coordinar)
  const confirmada = solicitud !== null && solicitud.estadoServicio !== 'solicitado' && !estaTerminada(solicitud.estadoServicio)
  const telefono = solicitud?.profesional?.telefono?.replace(/\D/g, '').replace(/^0/, '')

  return (
    <Dialog open={solicitud !== null} onClose={onClose} fullWidth maxWidth="sm" fullScreen={pantallaChica}>
      {solicitud && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            Solicitud #{solicitud.idSolicitud}
            <IconButton aria-label="Cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              {solicitud.profesional ? (
                <AvatarPersona nombre={solicitud.profesional.nombre} apellido={solicitud.profesional.apellido} tamaño={64} />
              ) : (
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.300', color: 'grey.700' }}>
                  <PersonSearchIcon fontSize="large" />
                </Avatar>
              )}
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="h6">
                  {solicitud.profesional ? `${solicitud.profesional.nombre} ${solicitud.profesional.apellido}`.trim() : 'Buscando profesional'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {solicitud.urgente && <Chip size="small" color="error" label="Urgente" />}
                  <Chip size="small" color={estadosCliente[solicitud.estadoServicio].color} label={estadosCliente[solicitud.estadoServicio].label} />
                  {solicitud.fechaPago && <Chip size="small" color="success" variant="outlined" label="Pagado" />}
                </Stack>
              </Stack>
            </Stack>

            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              {proximoPasoCliente(solicitud)}
            </Alert>

            {solicitud.estadoServicio === 'reprogramacion' && horarioPropuesto && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Horario propuesto: <strong>{formatoFecha(horarioPropuesto.toISOString())}</strong>
              </Alert>
            )}

            <Typography variant="subtitle2" gutterBottom>
              {solicitud.especialidad?.nombreEspecialidad ?? 'Problema'}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>{solicitud.descripcionProblema}</Typography>

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

            {solicitud.calificacionServicio != null && (
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Tu calificación</Typography>
                <Rating value={solicitud.calificacionServicio} readOnly />
                {solicitud.reseñaServicio && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    “{solicitud.reseñaServicio}”
                  </Typography>
                )}
              </Stack>
            )}

            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {direccion && <Dato titulo="Dirección">{direccion}</Dato>}
              {solicitud.fechaSolicitud && <Dato titulo="Pedida">{formatoFecha(solicitud.fechaSolicitud)}</Dato>}
              {solicitud.fechaVisita && <Dato titulo="Visita">{formatoFecha(solicitud.fechaVisita)}</Dato>}
              {solicitud.fechaInicio && <Dato titulo="Trabajo">{formatoFecha(solicitud.fechaInicio)}</Dato>}
              {solicitud.fechaFinReal && <Dato titulo="Terminado">{formatoFecha(solicitud.fechaFinReal)}</Dato>}
              {solicitud.costoVisita != null && <Dato titulo="Costo de visita">{formatoPesos(solicitud.costoVisita)}</Dato>}
              {solicitud.estadoServicio === 'presupuestado' && solicitud.costoFinal != null && (
                <Dato titulo="Presupuesto">{formatoPesos(solicitud.costoFinal)}</Dato>
              )}
              {solicitud.costoEstimado != null && solicitud.estadoServicio !== 'presupuestado' && (
                <Dato titulo="Presupuesto aceptado">{formatoPesos(solicitud.costoEstimado)}</Dato>
              )}
              {solicitud.horasTrabajo != null && <Dato titulo="Horas de trabajo">{`${solicitud.horasTrabajo} h`}</Dato>}
              {solicitud.fechaPago && <Dato titulo="Pagado">{formatoFecha(solicitud.fechaPago)}</Dato>}
            </Stack>
          </DialogContent>
          {acciones && <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>{acciones}</DialogActions>}
        </>
      )}
    </Dialog>
  )
}
