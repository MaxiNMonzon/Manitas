// Promociones bancarias vigentes este mes (GET /promocion/del-mes), para mostrarle al cliente.
import { api } from './client'
import type { PromoBancaria } from '../types'

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

const fecha = (valor: string) => new Date(`${valor.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })

export async function traerPromocionesDelMes(): Promise<PromoBancaria[]> {
  const lista = await api.get<PromocionApi[]>('/promocion/del-mes')
  return lista.map((promocion) => {
    const medios = (promocion.metodosPago ?? []).map((metodo) => metodo.tipo)
    // Los métodos traen el banco en el nombre (ej: "Visa crédito - Banco Galicia"): si todos son del mismo, se muestra el banco
    const bancos = new Set(medios.map((medio) => medio.split(' - ')[1] ?? medio))
    const banco = bancos.size === 1 ? [...bancos][0] : (medios[0] ?? 'Todos los medios de pago')
    return {
      idPromocion: promocion.idPromocion,
      banco,
      titulo: `${Number(promocion.porcentajeDescuento)}% de reintegro`,
      // Corto: el tope y las tarjetas están en la descripción; las fechas salen de la vigencia
      detalle: `${promocion.descripcion} · Válido del ${fecha(promocion.fechaInicioVigencia)} al ${fecha(promocion.fechaFinVigencia)}`,
      color: colorDe(banco),
      condiciones: promocion.descripcion,
      // Sin el banco, que ya está arriba (ej: "Visa crédito")
      tarjetas: medios.map((medio) => (bancos.size === 1 ? medio.split(' - ')[0] : medio)),
      vigencia: `Del ${fecha(promocion.fechaInicioVigencia)} al ${fecha(promocion.fechaFinVigencia)}`,
    }
  })
}