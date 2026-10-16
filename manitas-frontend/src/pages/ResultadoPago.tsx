import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { confirmarPagoMercadoPago } from '../api/pagos'

type Resultado = { tipo: 'ok' | 'error' | 'cancelado'; mensaje: string }

// Mercado Pago vuelve acá al terminar: /app/pagos/resultado?payment_id=...&status=...
// No alcanza con el "status" de la dirección (se puede cambiar a mano): el back
// le pregunta a Mercado Pago si el pago se aprobó y recién ahí lo marca como pagado
export default function ResultadoPago() {
  const [params] = useSearchParams()
  const paymentId = params.get('payment_id')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const yaConfirmado = useRef(false)

  useEffect(() => {
    // Sin número de pago: el cliente volvió sin pagar
    if (!paymentId || paymentId === 'null') {
      setResultado({ tipo: 'cancelado', mensaje: 'No se completó el pago. Podés intentarlo de nuevo.' })
      return
    }
    // En desarrollo React ejecuta el efecto dos veces: se confirma una sola
    if (yaConfirmado.current) return
    yaConfirmado.current = true
    confirmarPagoMercadoPago(paymentId)
      .then((s) =>
        setResultado({
          tipo: 'ok',
          mensaje: s.estadoServicio === 'finalizado' ? '¡Listo! El trabajo quedó pagado. Ya podés calificar al profesional.' : '¡Listo! La visita quedó pagada.',
        }),
      )
      .catch((e: Error) => setResultado({ tipo: 'error', mensaje: e.message }))
  }, [paymentId])

  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Pago con Mercado Pago
      </Typography>
      {!resultado ? (
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">Confirmando el pago…</Typography>
        </Stack>
      ) : (
        <Alert severity={resultado.tipo === 'ok' ? 'success' : resultado.tipo === 'cancelado' ? 'warning' : 'error'} sx={{ textAlign: 'left' }}>
          {resultado.mensaje}
        </Alert>
      )}
      <Button component={RouterLink} to="/app/pagos" sx={{ mt: 3 }}>
        Volver a Pagos
      </Button>
    </Paper>
  )
}