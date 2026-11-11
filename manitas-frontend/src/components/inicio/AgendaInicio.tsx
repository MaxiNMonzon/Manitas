import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SeccionTarjeta from '../SeccionTarjeta'
import ListaDeEventos from '../agenda/ListaDeEventos'
import ItemAgenda from '../agenda/ItemAgenda'
import type { EventoAgenda } from '../../types'

const PROXIMOS_VISIBLES = 2

interface Props {
  hoy: { eventos: EventoAgenda[]; cargando: boolean }
  // Los de los próximos 30 días (se muestran 2 y, si hay más, el botón "Ver más")
  proximos: { eventos: EventoAgenda[]; cargando: boolean }
}

// Abajo del Inicio del profesional: lo que tiene hoy y, si hoy no tiene nada,
// las próximas visitas y trabajos (para que el inicio no quede vacío)
export default function AgendaInicio({ hoy, proximos }: Props) {
  const sinNadaHoy = !hoy.cargando && hoy.eventos.length === 0

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <SeccionTarjeta
          titulo="Hoy"
          extra={
            <Button component={RouterLink} to="/app/agenda" size="small">
              Ver agenda
            </Button>
          }
        >
          <ListaDeEventos eventos={hoy.eventos} cargando={hoy.cargando} vacio="No tenés visitas ni trabajos para hoy." />
        </SeccionTarjeta>
      </Grid>

      {sinNadaHoy && (
        <Grid size={{ xs: 12 }}>
          <SeccionTarjeta
            titulo="Próximas visitas y trabajos"
            extra={
              // Se muestran 2; si hay más, el resto está en Solicitudes
              proximos.eventos.length > PROXIMOS_VISIBLES && (
                <Button component={RouterLink} to="/app/solicitudes" size="small">
                  Ver más
                </Button>
              )
            }
          >
            {proximos.cargando ? (
              <Skeleton variant="rounded" height={110} />
            ) : proximos.eventos.length === 0 ? (
              <Typography color="text.secondary">Por ahora no tenés nada agendado para los próximos 30 días.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {proximos.eventos.slice(0, PROXIMOS_VISIBLES).map((ev) => (
                  <ItemAgenda key={`${ev.idSolicitud}-${ev.tipo}-${ev.inicio.getTime()}`} evento={ev} mostrarFecha />
                ))}
              </Stack>
            )}
          </SeccionTarjeta>
        </Grid>
      )}
    </Grid>
  )
}
