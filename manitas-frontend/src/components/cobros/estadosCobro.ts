// Cómo se muestra cada estado de un cobro del profesional
import dayjs from 'dayjs'
import type { Cobro, EstadoCobro } from '../../types'

export const estadosCobro: Record<EstadoCobro, { label: string; color: 'success' | 'warning' }> = {
  cobrado: { label: 'Cobrado', color: 'success' },
  pendiente_cobro: { label: 'Pendiente de cobro', color: 'warning' },
}

// Orden para mostrar (y para la barra del mes): lo ya cobrado primero
export const ORDEN_ESTADOS: EstadoCobro[] = ['cobrado', 'pendiente_cobro']

// "$ 130.000" y, para los ejes de los gráficos, "$130k"
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
export const formatoPesos = (monto: number) => pesos.format(monto)
export const pesosCorto = (monto: number) => (monto >= 1000 ? `$${Math.round(monto / 1000)}k` : `$${monto}`)

// Mes en el que cuenta un cobro: el del pago. Los que esperan el pago cuentan en el mes actual
export function mesDe(c: Cobro): string {
  return dayjs(c.fechaPago ?? undefined).format('YYYY-MM')
}

// Número de comprobante armado con el id de la solicitud (ej: "0001-00000123")
export const numeroComprobante = (c: Cobro) => `0001-${String(c.idSolicitud).padStart(8, '0')}`