import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ItemAgenda from './ItemAgenda'
import type { EventoAgenda } from '../../types'

// Lista de visitas/trabajos (o un texto si no hay, o esqueletos mientras carga).
// Las urgentes van siempre primero; el resto, en el orden en que vienen (por hora)
export default function ListaDeEventos({ eventos, cargando, vacio }: { eventos: EventoAgenda[]; cargando: boolean; vacio: string }) {
  if (cargando) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={110} />
        <Skeleton variant="rounded" height={110} />
      </Stack>
    )
  }
  if (eventos.length === 0) {
    return <Typography color="text.secondary">{vacio}</Typography>
  }
  return (
    <Stack spacing={1.5}>
      {[...eventos].sort((a, b) => Number(b.urgente) - Number(a.urgente)).map((e) => (
        <ItemAgenda key={`${e.idSolicitud}-${e.tipo}`} evento={e} />
      ))}
    </Stack>
  )
}