import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { traerTurnosLibres } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'

const DIAS_A_MOSTRAR = 30 // el back deja pedir hasta 31 días juntos

interface Props {
  idProfesional: number | null
  // Inicio del turno elegido (texto ISO, como viene del back) o null
  valor: string | null
  onChange: (inicio: string | null) => void
  etiquetaHora?: string
  // Turnos que no hay que ofrecer (ej: los que empiezan antes de 12 h, para reprogramar)
  desde?: Dayjs
}

// Elegir uno de los turnos libres del profesional (GET /turnos/libres/:id): primero el día
// (solo se pueden elegir los que tienen algún turno) y después la hora
export default function SelectorTurno({ idProfesional, valor, onChange, etiquetaHora = 'Hora', desde }: Props) {
  const [dia, setDia] = useState<Dayjs | null>(valor ? dayjs(valor) : null)
  const hoy = dayjs().format('YYYY-MM-DD')
  const libres = useCarga(`libres-${idProfesional ?? 'ninguno'}-${hoy}`, () =>
    idProfesional ? traerTurnosLibres(idProfesional, hoy, dayjs().add(DIAS_A_MOSTRAR, 'day').format('YYYY-MM-DD')) : Promise.resolve([]),
  )

  const turnos = (libres.datos ?? []).filter((t) => !desde || dayjs(t.inicio).isAfter(desde))
  const diasConTurnos = new Set(turnos.map((t) => dayjs(t.inicio).format('YYYY-MM-DD')))
  const delDia = dia ? turnos.filter((t) => dayjs(t.inicio).isSame(dia, 'day')) : []

  if (libres.cargando) return <Skeleton variant="rounded" height={56} />
  if (libres.error) return <Alert severity="error">{libres.error}</Alert>
  if (turnos.length === 0) {
    return <Alert severity="warning">No hay turnos libres en los próximos {DIAS_A_MOSTRAR} días.</Alert>
  }

  return (
    <Stack spacing={2}>
      <DatePicker
        label="Día"
        value={dia}
        onChange={(d) => {
          setDia(d)
          onChange(null)
        }}
        disablePast
        maxDate={dayjs().add(DIAS_A_MOSTRAR, 'day')}
        shouldDisableDate={(d) => !diasConTurnos.has(d.format('YYYY-MM-DD'))}
      />
      {dia && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {etiquetaHora}
          </Typography>
          {delDia.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Ese día no tiene turnos libres.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {delDia.map((t) => (
                <Chip
                  key={t.inicio}
                  label={dayjs(t.inicio).format('HH:mm')}
                  color={valor === t.inicio ? 'primary' : 'default'}
                  variant={valor === t.inicio ? 'filled' : 'outlined'}
                  onClick={() => onChange(t.inicio)}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  )
}