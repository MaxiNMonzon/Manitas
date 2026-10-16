import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import PaymentIcon from '@mui/icons-material/Payment'
import { irAPagarConMercadoPago } from '../../api/pagos'

// Botón de pago con Mercado Pago (lo hizo Mica): pide al backend el link de pago
// de esa solicitud (POST /payments/create-preference) y redirige al checkout.
// El precio no lo manda el front: el back lo saca de la solicitud
export default function CheckoutButton({ idSolicitud }: { idSolicitud: number }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pagar = async () => {
    setCargando(true)
    setError(null)
    try {
      // A partir de acá el flujo lo maneja Mercado Pago (la página se va a su sitio)
      // y al terminar vuelve a /app/pagos/resultado
      window.location.href = await irAPagarConMercadoPago(idSolicitud)
    } catch (e) {
      // Ej: "No se pudo conectar con el servidor" o "Mercado Pago no esta configurado"
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el pago')
      setCargando(false)
    }
  }

  return (
    <Stack spacing={1.5}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" startIcon={<PaymentIcon />} onClick={pagar} loading={cargando}>
        Pagar con Mercado Pago
      </Button>
    </Stack>
  )
}