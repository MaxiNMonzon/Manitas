import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import PaymentIcon from '@mui/icons-material/Payment'
import { irAPagarConMercadoPago } from '../../api/pagos'
import { tokenStorage } from '../../api/client'

// Botón de pago con Mercado Pago (lo hizo Mica): pide al backend el link de pago
// de esa solicitud (POST /payments/create-preference) y lleva al checkout de Mercado Pago.
// Ahí se elige el medio y las cuotas y se paga; al tocar "Volver al sitio" vuelve a
// /app/pagos/resultado, que confirma el pago. El precio no lo manda el front: el back lo saca de la solicitud
export default function CheckoutButton({ idSolicitud }: { idSolicitud: number }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // La sesión demo no tiene back: no hay con qué armar el pago
  const esDemo = tokenStorage.esDemo()

  const pagar = async () => {
    setCargando(true)
    setError(null)
    try {
      // A partir de acá el flujo lo maneja Mercado Pago (la página se va a su sitio)
      window.location.href = await irAPagarConMercadoPago(idSolicitud)
    } catch (e) {
      // Ej: "No se pudo conectar con el servidor" o "Mercado Pago no esta configurado"
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el pago')
      setCargando(false)
    }
  }

  return (
    <Stack spacing={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="contained"
        color="secondary"
        startIcon={<PaymentIcon />}
        onClick={pagar}
        loading={cargando}
        disabled={esDemo}
        title={esDemo ? 'Para pagar iniciá sesión con una cuenta real' : undefined}
      >
        Pagar
      </Button>
    </Stack>
  )
}
