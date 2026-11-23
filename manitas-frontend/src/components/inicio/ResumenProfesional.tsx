import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import AssignmentIcon from '@mui/icons-material/Assignment'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import StarIcon from '@mui/icons-material/Star'
import TarjetaDato from '../profesional/TarjetaDato'
import MedidorCalificacion from '../profesional/MedidorCalificacion'
import type { SolicitudResumen } from '../../types'

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

// Solicitudes activas: las que están en curso (agendadas, presupuestadas, contratadas o cambiando de horario)
const activas = (solicitudes: SolicitudResumen[]) =>
  solicitudes.filter((solicitud) => ['agendado', 'presupuestado', 'contratado', 'reprogramacion'].includes(solicitud.estadoServicio)).length

interface Props {
  solicitudes: SolicitudResumen[]
  // Lo pendiente de cobro ya calculado por el back (el mismo número que en "Mis cobros")
  pendiente: { monto: number; cantidad: number } | null
  calificacion: { promedio: number | null; cantidad: number } | null
  cargando: boolean
}

// Arriba del Inicio del profesional: solicitudes activas, cobros pendientes y su calificación.
// Cada tarjeta lleva a su pestaña
export default function ResumenProfesional({ solicitudes, pendiente, calificacion, cargando }: Props) {
  const navigate = useNavigate()

  if (cargando) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2].map((indice) => (
          <Grid key={indice} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={112} />
          </Grid>
        ))}
      </Grid>
    )
  }

  const cantidadPendiente = pendiente?.cantidad ?? 0

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TarjetaDato
          icono={<AssignmentIcon />}
          titulo="Solicitudes activas"
          valor={String(activas(solicitudes))}
          detalle="Agendadas, presupuestadas o contratadas"
          color="primary"
          onClick={() => navigate('/app/solicitudes')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TarjetaDato
          icono={<RequestQuoteIcon />}
          titulo="Cobros pendientes"
          valor={pesos.format(pendiente?.monto ?? 0)}
          detalle={cantidadPendiente === 0 ? 'No tenés cobros pendientes' : `${cantidadPendiente} cobro${cantidadPendiente === 1 ? '' : 's'} sin pagar o sin depositar`}
          color="secondary"
          onClick={() => navigate('/app/cobros')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TarjetaDato icono={<StarIcon />} titulo="Tu calificación" color="warning" onClick={() => navigate('/app/perfil')}>
          <MedidorCalificacion promedio={calificacion?.promedio ?? null} cantidad={calificacion?.cantidad ?? 0} />
        </TarjetaDato>
      </Grid>
    </Grid>
  )
}
