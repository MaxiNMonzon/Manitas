import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EventIcon from '@mui/icons-material/Event'
import PlaceIcon from '@mui/icons-material/Place'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import Avatar from '@mui/material/Avatar'
import AvatarPersona from '../AvatarPersona'
import { formatoFecha } from './estados'
import { estadosCliente, estaTerminada, fechaClave, leTocaAlCliente, proximoPasoCliente } from './estadosCliente'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitud: SolicitudResumen
  // Dirección del cliente (donde es la visita)
  direccion: string | null
  onVerDetalles: () => void
}

// Una solicitud en la lista del cliente (boceto "Mis solicitudes"): foto del profesional, su nombre,
// el trabajo, la fecha y la dirección a la izquierda; el estado y "Ver detalles" a la derecha
export default function TarjetaSolicitudCliente({ solicitud: s, direccion, onVerDetalles }: Props) {
  const estado = estadosCliente[s.estadoServicio]
  const fecha = fechaClave(s)
  const terminada = estaTerminada(s.estadoServicio)
  const pendienteDeRespuesta = leTocaAlCliente(s)
  const nombre = s.profesional ? `${s.profesional.nombre} ${s.profesional.apellido}`.trim() : 'Buscando profesional'

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        // Lo que espera una respuesta del cliente se marca con un borde de color; las urgentes en rojo
        borderLeft: (s.urgente && !terminada) || pendienteDeRespuesta ? 5 : undefined,
        borderLeftColor: s.urgente && !terminada ? 'error.main' : 'secondary.main',
        opacity: terminada && s.estadoServicio !== 'finalizado' ? 0.8 : 1,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
          {s.profesional ? (
            <AvatarPersona nombre={s.profesional.nombre} apellido={s.profesional.apellido} tamaño={56} />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.300', color: 'grey.700' }}>
              <PersonSearchIcon />
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {nombre}
              </Typography>
              {s.urgente && <Chip size="small" color="error" label="Urgente" />}
              {s.fechaPago && <Chip size="small" color="success" variant="outlined" label="Pagado" />}
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {s.descripcionProblema}
            </Typography>
            {s.especialidad && (
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                {s.especialidad.nombreEspecialidad}
              </Typography>
            )}
            {fecha && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <EventIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
                  {fecha.que}: {formatoFecha(fecha.fecha)}
                </Typography>
              </Stack>
            )}
            {direccion && !terminada && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <PlaceIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{direccion}</Typography>
              </Stack>
            )}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontWeight: 500, color: pendienteDeRespuesta ? 'secondary.dark' : 'text.primary' }}
            >
              {proximoPasoCliente(s)}
            </Typography>
          </Box>
        </Stack>

        {/* Como en el boceto: el estado arriba y el botón abajo */}
        <Stack
          spacing={1}
          sx={{ justifyContent: 'center', alignItems: { xs: 'stretch', sm: 'flex-end' }, flexShrink: 0, minWidth: { sm: 170 } }}
        >
          <Chip color={estado.color} variant={terminada ? 'outlined' : 'filled'} label={estado.label} sx={{ fontWeight: 600 }} />
          <Button size="small" variant={pendienteDeRespuesta ? 'contained' : 'outlined'} onClick={onVerDetalles}>
            Ver detalles
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}