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
    // Los métodos traen el banco en el nombre (ej: "Visa crédito - Banco Galicia"): si todos son del mismo, se muestra el banco
    const bancos = new Set(medios.map((m) => m.split(' - ')[1] ?? m))
    const banco = bancos.size === 1 ? [...bancos][0] : (medios[0] ?? 'Todos los medios de pago')
    return {
      idPromocion: p.idPromocion,
      banco,
      titulo: `${Number(p.porcentajeDescuento)}% de reintegro`,
      // Corto: el tope y las tarjetas están en la descripción; las fechas salen de la vigencia
      detalle: `${p.descripcion} · Válido del ${fecha(p.fechaInicioVigencia)} al ${fecha(p.fechaFinVigencia)}`,
      color: colorDe(banco),
      condiciones: p.descripcion,
      // Sin el banco, que ya está arriba (ej: "Visa crédito")
      tarjetas: medios.map((m) => (bancos.size === 1 ? m.split(' - ')[0] : m)),
      vigencia: `Del ${fecha(p.fechaInicioVigencia)} al ${fecha(p.fechaFinVigencia)}`,
    }
  })
}
