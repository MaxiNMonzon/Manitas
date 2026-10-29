import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PaymentIcon from '@mui/icons-material/Payment'
import { useAuth } from '../auth/useAuth'
import { tokenStorage } from '../api/client'
import { traerSolicitudesCliente } from '../api/solicitudes'
import { useCarga } from '../hooks/useCarga'
import CheckoutButton from '../components/pagos/CheckoutButton'
import { formatoPesos } from '../components/solicitudes/estados'
import { debePagar } from '../components/solicitudes/estadosCliente'
import EnConstruccion from './EnConstruccion'

// Pestaña "Pagos" del cliente: lo que tiene para pagar (el trabajo contratado que ya empezó,
// o la visita de un presupuesto que rechazó). Por ahora solo con Mercado Pago (modo prueba);
// pagar con una tarjeta guardada ya está en el back (PATCH /solicitud-de-servicio/:id/pagar).
// También se puede pagar desde el detalle de cada solicitud, en "Mis solicitudes"
export default function Pagos() {
  const { sesion } = useAuth()
  const esCliente = sesion?.rol === 'cliente'
  const { datos, error, cargando } = useCarga('pagos', () => (esCliente ? traerSolicitudesCliente() : Promise.resolve([])))

  if (!esCliente) return <EnConstruccion titulo="Pagos" />

  const pendientes = (datos ?? []).filter(debePagar)

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h5">Pagos</Typography>
      </Stack>

      {tokenStorage.esDemo() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Con la sesión de prueba no se puede pagar: el pago pasa por Mercado Pago y necesita una cuenta real.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {cargando && <CircularProgress />}
      {!cargando && pendientes.length === 0 && <Typography color="text.secondary">No tenés nada para pagar.</Typography>}

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
