import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PaymentIcon from '@mui/icons-material/Payment'
import CheckoutButton from '../components/pagos/CheckoutButton'
import { formatoPesos } from '../components/cobros/estadosCobro'

// Lo mismo que va a pagar el CheckoutButton (también se muestra en el resumen)
const tituloServicio = 'Servicio de Manitas'
const precio = 5000
const cantidad = 1

// Pantalla provisoria de prueba: el checkout de Mercado Pago.
// Reemplaza por ahora el placeholder "Pagos" hasta que exista la lista de pagos real
export default function Pagos() {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <PaymentIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
      <Typography variant="h5" gutterBottom>
        Pagos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Probando el checkout de Mercado Pago: al pagar, te llevamos a su sitio para completar el pago.
      </Typography>

      <Stack spacing={0.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {tituloServicio} · {cantidad} unidad{cantidad === 1 ? '' : 'es'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {formatoPesos(precio * cantidad)}
        </Typography>
      </Stack>

      <CheckoutButton title={tituloServicio} price={precio} quantity={cantidad} />
    </Paper>
  )
}