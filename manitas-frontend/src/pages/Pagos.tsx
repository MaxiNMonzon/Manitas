import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PaymentIcon from '@mui/icons-material/Payment'
import { useAuth } from '../auth/useAuth'
import { tokenStorage } from '../api/client'
import { traerMisSolicitudes } from '../api/solicitudes'
import { useCarga } from '../hooks/useCarga'
import CheckoutButton from '../components/pagos/CheckoutButton'
import { formatoPesos } from '../components/cobros/estadosCobro'
import EnConstruccion from './EnConstruccion'
import type { SolicitudResumen } from '../types'

// Lo que el cliente tiene para pagar: el trabajo contratado que ya empezó,
// o la visita de un presupuesto que rechazó (si el profesional la cobra).
// ('contratado' es un estado nuevo del back: falta sumarlo al tipo EstadoSolicitud del front)
function paraPagar(s: SolicitudResumen) {
  if (s.fechaPago) return false
  const estado = s.estadoServicio as string
  if (estado === 'contratado') return !!s.fechaInicio && new Date(s.fechaInicio) <= new Date()
  if (estado === 'rechazado') return !!s.costoFinal && !s.fechaInicio
  return false
}

// Pestaña "Pagos" del cliente. Por ahora solo con Mercado Pago (modo prueba);
// pagar con una tarjeta guardada ya está en el back (PATCH /solicitud-de-servicio/:id/pagar)
export default function Pagos() {
  const { sesion } = useAuth()
  const esCliente = sesion?.rol === 'cliente' && !tokenStorage.esDemo()
  const { datos, error, cargando } = useCarga('pagos', () => (esCliente ? traerMisSolicitudes() : Promise.resolve([])))

  if (sesion?.rol !== 'cliente') return <EnConstruccion titulo="Pagos" />

  const pendientes = (datos ?? []).filter(paraPagar)

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h5">Pagos</Typography>
      </Stack>

      {tokenStorage.esDemo() && <Alert severity="info">Con la sesión de prueba no se puede pagar: iniciá sesión con una cuenta real.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {cargando && esCliente && <CircularProgress />}
      {!cargando && esCliente && pendientes.length === 0 && (
        <Typography color="text.secondary">No tenés nada para pagar.</Typography>
      )}

      <Stack spacing={2}>
        {pendientes.map((s) => (
          <Paper key={s.idSolicitud} variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
              <div>
                <Typography sx={{ fontWeight: 600 }}>
                  {s.estadoServicio === 'rechazado' ? 'Visita' : 'Trabajo'} de {s.especialidad?.nombreEspecialidad ?? 'servicio'}
                  {s.profesional ? ` con ${s.profesional.nombre}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.descripcionProblema}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatoPesos(Number(s.costoFinal))}
                </Typography>
              </div>
              <CheckoutButton idSolicitud={s.idSolicitud} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
