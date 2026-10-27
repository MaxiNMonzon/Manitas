import { Navigate, useLocation } from 'react-router-dom'

// Dirección vieja de vuelta de Mercado Pago (/app/pagos/resultado). Ahora Mercado Pago vuelve directo
// a "Mis solicitudes", que confirma el pago. Si llega alguien acá (ej: un pago iniciado antes del cambio),
// se lo manda allá con los mismos datos del pago
export default function ResultadoPago() {
  const { search } = useLocation()
  return <Navigate to={`/app/solicitudes${search}`} replace />
}