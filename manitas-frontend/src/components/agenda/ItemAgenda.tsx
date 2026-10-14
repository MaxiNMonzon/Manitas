import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import DirectionsIcon from '@mui/icons-material/Directions'
import PlaceIcon from '@mui/icons-material/Place'
import dayjs from 'dayjs'
import type { EventoAgenda } from '../../types'

// Color de cada visita/trabajo en la agenda
function colorDeEvento(evento: Pick<EventoAgenda, 'tipo' | 'urgente'>): string {
  if (evento.urgente) return 'error.main'
  return evento.tipo === 'visita' ? 'primary.main' : 'secondary.main'
}

// Link de WhatsApp con un teléfono argentino guardado como "3411112222"
function linkWhatsApp(telefono: string): string {
  const numero = telefono.replace(/\D/g, '').replace(/^0/, '')
  return `https://wa.me/549${numero}`
}

function horario(evento: EventoAgenda): string {
  const inicio = dayjs(evento.inicio)
  const fin = dayjs(evento.fin)
  // Trabajos de varios días: se muestra el día de fin
  return inicio.isSame(fin, 'day')
    ? `${inicio.format('HH:mm')} – ${fin.format('HH:mm')}`
    : `${inicio.format('HH:mm')} – ${fin.format('DD/MM HH:mm')}`
}

// Una visita o un trabajo de la agenda, con acciones para contactar y llegar
export default function ItemAgenda({ evento, mostrarFecha = false }: { evento: EventoAgenda; mostrarFecha?: boolean }) {
  // La hora se toma al mostrarse (no cambia en cada render)
  const [ahora] = useState(() => Date.now())
  const yaPaso = evento.fin.getTime() < ahora
  const ubicacion = [evento.direccion, evento.zona].filter(Boolean).join(', ')

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderLeft: 5, borderLeftColor: colorDeEvento(evento), opacity: yaPaso ? 0.6 : 1 }}
    >
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {mostrarFecha && `${dayjs(evento.inicio).format('ddd DD/MM')} · `}
          {horario(evento)}
        </Typography>
        <Chip size="small" label={evento.tipo === 'visita' ? 'Visita' : 'Trabajo'} />
        {evento.urgente && <Chip size="small" color="error" label="Urgente" />}
        {evento.estado === 'finalizado' && <Chip size="small" color="success" variant="outlined" label="Finalizado" />}
        {evento.estado === 'presupuestado' && <Chip size="small" color="info" variant="outlined" label="Presupuestado" />}
      </Stack>

      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {evento.con ? `${evento.con.nombre} ${evento.con.apellido}` : 'Sin asignar'}
        {evento.especialidad && (
          <Typography component="span" color="text.secondary">
            {' '}
            · {evento.especialidad}
          </Typography>
        )}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {evento.descripcionProblema}
      </Typography>

      {ubicacion && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1, color: 'text.secondary' }}>
          <PlaceIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">{ubicacion}</Typography>
        </Stack>
      )}

      {!yaPaso && (evento.con || evento.direccion) && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          {evento.con && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              href={linkWhatsApp(evento.con.telefono)}
              target="_blank"
              rel="noopener"
            >
              WhatsApp
            </Button>
          )}
          {evento.direccion && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<DirectionsIcon />}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`}
              target="_blank"
              rel="noopener"
            >
              Cómo llegar
            </Button>
          )}
        </Box>
      )}
    </Paper>
  )
}
