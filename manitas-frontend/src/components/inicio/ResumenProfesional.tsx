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

// Números del resumen, calculados con las solicitudes del profesional
function resumen(solicitudes: SolicitudResumen[]) {
  const enCurso = solicitudes.filter((s) => ['agendado', 'presupuestado', 'contratado', 'reprogramacion'].includes(s.estadoServicio))
  // Por cobrar: trabajos con presupuesto aceptado que todavía no se pagaron
  const porCobrar = solicitudes.filter((s) => (s.estadoServicio === 'contratado' || s.estadoServicio === 'agendado') && s.costoEstimado != null && !s.fechaPago)
  return {
    activas: enCurso.length,
    porCobrar: porCobrar.reduce((total, s) => total + (s.costoFinal ?? 0), 0),
    cantidadPorCobrar: porCobrar.length,
  }
}

interface Props {
  solicitudes: SolicitudResumen[]
  calificacion: { promedio: number | null; cantidad: number } | null
  cargando: boolean
}

// Arriba del Inicio del profesional: solicitudes activas, cobros pendientes y su calificación.
// Cada tarjeta lleva a su pestaña
export default function ResumenProfesional({ solicitudes, calificacion, cargando }: Props) {
  const navigate = useNavigate()

  if (cargando) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={112} />
          </Grid>
        ))}
      </Grid>
    )
  }

  const datos = resumen(solicitudes)
  const plural = datos.cantidadPorCobrar === 1 ? '' : 's'

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TarjetaDato
          icono={<AssignmentIcon />}
          titulo="Solicitudes activas"
          valor={String(datos.activas)}
          detalle="Agendadas, presupuestadas o contratadas"
          color="primary"
          onClick={() => navigate('/app/solicitudes')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TarjetaDato
          icono={<RequestQuoteIcon />}
          titulo="Cobros pendientes"
          valor={pesos.format(datos.porCobrar)}
          detalle={`${datos.cantidadPorCobrar} trabajo${plural} aceptado${plural} sin pagar`}
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
