import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EventIcon from '@mui/icons-material/Event'
import PlaceIcon from '@mui/icons-material/Place'
import AvatarPersona from '../AvatarPersona'
import { direccionDe, estados, fechaPrincipal, formatoFecha, proximoPaso } from './estados'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitud: SolicitudResumen
  onVerDetalles: () => void
  // Botones de la acción que corresponde al estado (agendar, presupuestar...)
  acciones?: ReactNode
  // El chip de estado sobra cuando la lista ya está filtrada por ese estado
  mostrarEstado?: boolean
}

// Una solicitud en la lista del profesional (según el boceto: foto, cliente, trabajo, fecha y
// dirección a la izquierda; botones a la derecha). Los chips van junto al nombre, separados de
// los botones para que no se confundan con ellos.
export default function TarjetaSolicitud({ solicitud: s, onVerDetalles, acciones, mostrarEstado = true }: Props) {
  const estado = estados[s.estadoServicio]
  const fecha = fechaPrincipal(s)
  const lugar = direccionDe(s.cliente, s.estadoServicio)
  const nombre = s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}`.trim() : 'Cliente'
  const terminada = ['finalizado', 'rechazado', 'cancelado', 'expirado'].includes(s.estadoServicio)

  return (
    <Paper
      variant="outlined"
      // Urgente en curso: borde rojo para que se note
      sx={{ p: 2, borderLeft: s.urgente && !terminada ? 5 : undefined, borderLeftColor: 'error.main' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
          <AvatarPersona nombre={s.cliente?.nombre ?? '?'} apellido={s.cliente?.apellido} tamaño={52} />
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {nombre}
              </Typography>
              {s.urgente && <Chip size="small" color="error" label="Urgente" />}
              {mostrarEstado && <Chip size="small" variant="outlined" color={estado.color} label={estado.label} />}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {s.especialidad && <strong>{s.especialidad.nombreEspecialidad} · </strong>}
              {s.descripcionProblema}
            </Typography>
            {fecha && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <EventIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
                  {fecha.que}: {formatoFecha(fecha.fecha)}
                </Typography>
              </Stack>
            )}
            {lugar && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <PlaceIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{lugar}</Typography>
              </Stack>
            )}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontWeight: 500, color: s.estadoServicio === 'solicitado' ? 'warning.dark' : 'text.primary' }}
            >
              {proximoPaso(s)}
            </Typography>
          </Box>
        </Stack>

        <Stack
          spacing={1}
          sx={{ justifyContent: 'center', alignItems: { xs: 'stretch', sm: 'flex-end' }, flexShrink: 0, minWidth: { sm: 170 } }}
        >
          {acciones}
          <Button size="small" variant="outlined" onClick={onVerDetalles}>
            Ver detalles
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}