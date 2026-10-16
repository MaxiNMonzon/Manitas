import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import PaymentIcon from '@mui/icons-material/Payment'
import { api } from '../../api/client'

interface Props {
  title?: string
  price?: number
  quantity?: number
}

// Botón de pago con Mercado Pago: pide al backend una preferencia
// (POST /payments/create-preference) y redirige al checkout con el init_point
export default function CheckoutButton({ title = 'Servicio de Manitas', price = 5000, quantity = 1 }: Props) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pagar = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await api.post<{ init_point: string }>('/payments/create-preference', { title, price, quantity })
      if (!data?.init_point) throw new Error('Mercado Pago no devolvió el enlace de pago')
      // A partir de acá el flujo lo maneja Mercado Pago (la página se va a su sitio)
      window.location.href = data.init_point
    } catch (e) {
      // Ej: "No se pudo conectar con el servidor" o el mensaje del backend
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el pago')
      setCargando(false)
    }
  }

  return (
    <Stack spacing={1.5}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" size="large" startIcon={<PaymentIcon />} onClick={pagar} loading={cargando}>
        Pagar con Mercado Pago
      </Button>
    </Stack>
  )
}