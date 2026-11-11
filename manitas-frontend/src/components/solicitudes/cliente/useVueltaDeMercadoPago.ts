import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { confirmarPagoMercadoPago } from '../../../api/pagos'
import type { SolicitudResumen } from '../../../types'

interface Opciones {
  // Salió bien: el back confirmó con Mercado Pago que el pago se aprobó
  onPagado: (s: SolicitudResumen) => void
  // No se pagó (rechazado, abandonado o el back no lo pudo confirmar)
  onError: (mensaje: string) => void
  // Siempre, al terminar: con el id de la solicitud que se intentó pagar
  onTerminado: (idSolicitud: number) => void
}

// Al tocar "Volver al sitio" en Mercado Pago se vuelve a "Mis solicitudes" con
// ?payment_id=...&status=...&external_reference=<idSolicitud>.
// No alcanza con el "status" de la dirección (se puede cambiar a mano), así que el back le pregunta a
// Mercado Pago si el pago se aprobó y recién ahí marca la solicitud como pagada.
// Después se sacan los datos del pago de la dirección. Devuelve true mientras se está confirmando.
export function useVueltaDeMercadoPago({ onPagado, onError, onTerminado }: Opciones): boolean {
  const [params, setParams] = useSearchParams()
  const idSolicitud = params.get('payment_id') || params.get('status') ? Number(params.get('external_reference')) || null : null
  const [confirmando, setConfirmando] = useState(idSolicitud !== null)
  const procesado = useRef(false)

  // Las funciones cambian en cada render de la página: se guarda la última para no repetir el efecto
  const avisos = useRef({ onPagado, onError, onTerminado })
  useEffect(() => {
    avisos.current = { onPagado, onError, onTerminado }
  })

  useEffect(() => {
    if (idSolicitud === null || procesado.current) return
    // En desarrollo React ejecuta el efecto dos veces: se confirma una sola
    procesado.current = true
    const paymentId = params.get('payment_id')
    const status = params.get('status')
    const confirmar =
      !paymentId || paymentId === 'null' || status !== 'approved'
        ? Promise.reject(
            new Error(status === 'rejected' ? 'Mercado Pago rechazó el pago. Podés intentarlo de nuevo.' : 'No se completó el pago. Podés intentarlo de nuevo.'),
          )
        : confirmarPagoMercadoPago(paymentId)
    confirmar
      .then((s) => avisos.current.onPagado(s))
      .catch((e: Error) => avisos.current.onError(e.message))
      .finally(() => {
        setConfirmando(false)
        setParams({}, { replace: true })
        avisos.current.onTerminado(idSolicitud)
      })
  }, [idSolicitud, params, setParams])

  return confirmando
}
