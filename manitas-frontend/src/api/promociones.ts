// Promociones bancarias vigentes este mes (GET /promocion/del-mes), para mostrarle al cliente.
// Con la sesión demo (provisoria) usa las de ejemplo.
import { api, tokenStorage } from './client'
import { promocionesDelMes, type PromoBancaria } from '../mocks/inicioCliente'

// Como viene del back
interface PromocionApi {
  idPromocion: number
  codigo: string
  descripcion: string
  porcentajeDescuento: number | string // decimal: MySQL lo devuelve como texto
  fechaInicioVigencia: string
  fechaFinVigencia: string
  metodosPago?: { idFormaPago: number; tipo: string }[]
}

// Color fijo por banco/método (sale del nombre), para el ícono de la tarjeta
function colorDe(texto: string): string {
  let hash = 0
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 360
  return `hsl(${hash}, 60%, 40%)`
}

const fecha = (v: string) => new Date(`${v.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })

export async function traerPromocionesDelMes(): Promise<PromoBancaria[]> {
  if (tokenStorage.esDemo()) return promocionesDelMes
  const lista = await api.get<PromocionApi[]>('/promocion/del-mes')
  return lista.map((p) => {
    const medios = (p.metodosPago ?? []).map((m) => m.tipo)
    const banco = medios[0] ?? 'Todos los medios de pago'
    return {
      idPromocion: p.idPromocion,
      banco,
      titulo: `${Number(p.porcentajeDescuento)}% de reintegro`,
      detalle: `${p.descripcion}${medios.length > 1 ? ` · También con ${medios.slice(1).join(', ')}` : ''} · Del ${fecha(p.fechaInicioVigencia)} al ${fecha(p.fechaFinVigencia)}`,
      color: colorDe(banco),
    }
  })
}