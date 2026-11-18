import { createContext, useContext } from 'react'
import Badge from '@mui/material/Badge'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton'
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay'
import dayjs, { type Dayjs } from 'dayjs'
import type { EventoAgenda } from '../../types'

// Días ('AAAA-MM-DD') que tienen algo agendado, para marcarlos con un punto
const DiasOcupados = createContext<Set<string>>(new Set())

function DiaConPunto(props: PickerDayProps) {
  const ocupados = useContext(DiasOcupados)
  const marcado = !props.outsideCurrentMonth && ocupados.has(dayjs(props.day).format('YYYY-MM-DD'))
  return (
    <Badge
      overlap="circular"
      variant="dot"
      color="secondary"
      invisible={!marcado}
      sx={{ '& .MuiBadge-badge': { bottom: 6, top: 'auto', right: '50%', transform: 'translateX(50%)' } }}
    >
      <PickerDay {...props} />
    </Badge>
  )
}

// Todos los días que ocupa cada evento (un trabajo puede durar varios días)
function diasDe(eventos: EventoAgenda[]): Set<string> {
  const dias = new Set<string>()
  for (const e of eventos) {
    let dia = dayjs(e.inicio).startOf('day')
    const ultimo = dayjs(e.fin).startOf('day')
    while (!dia.isAfter(ultimo)) {
      dias.add(dia.format('YYYY-MM-DD'))
      dia = dia.add(1, 'day')
    }
  }
  return dias
}

interface Props {
  eventos: EventoAgenda[]
  diaElegido: Dayjs
  onElegirDia: (dia: Dayjs) => void
  onCambiarMes: (mes: Dayjs) => void
  cargando: boolean
}

// Calendario del mes con un punto en los días que tienen visitas o trabajos
export default function CalendarioMensual({ eventos, diaElegido, onElegirDia, onCambiarMes, cargando }: Props) {
  return (
    <DiasOcupados.Provider value={diasDe(eventos)}>
      <DateCalendar
        value={diaElegido}
        onChange={(dia) => dia && onElegirDia(dia)}
        onMonthChange={onCambiarMes}
        loading={cargando}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{ day: DiaConPunto }}
        sx={{ width: '100%', maxWidth: 360 }}
      />
    </DiasOcupados.Provider>
  )
}
