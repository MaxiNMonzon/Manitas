// Las cuentas de "Mis cobros" del profesional (resumen, filtros e historial).
// Son funciones puras: reciben la lista de cobros y devuelven números; no dibujan nada.
import dayjs, { type Dayjs } from 'dayjs'
import { mesDe } from './estadosCobro'
import type { Cobro, EstadoCobro } from '../../types'

export const MESES_HISTORIAL = 6

// Vacío = sin filtrar por eso
export interface Filtros {
  estados: EstadoCobro[]
  conceptos: Cobro['concepto'][]
  especialidades: string[]
}
export const SIN_FILTROS: Filtros = { estados: [], conceptos: [], especialidades: [] }

export const pagados = (lista: Cobro[]) => lista.filter((c) => c.fechaPago != null)
export const total = (lista: Cobro[]) => lista.reduce((suma, c) => suma + c.monto, 0)
export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

export function pasaFiltros(c: Cobro, f: Filtros): boolean {
  return (
    (f.estados.length === 0 || f.estados.includes(c.estado)) &&
    (f.conceptos.length === 0 || f.conceptos.includes(c.concepto)) &&
    (f.especialidades.length === 0 || f.especialidades.includes(c.especialidad ?? ''))
  )
}

export const cantidadDeFiltros = (f: Filtros) => f.estados.length + f.conceptos.length + f.especialidades.length

// Suma los montos por una clave (ej: especialidad) para las tortas, de mayor a menor
export function agrupar(lista: Cobro[], clave: (c: Cobro) => string) {
  const sumas = new Map<string, number>()
  for (const c of lista) sumas.set(clave(c), (sumas.get(clave(c)) ?? 0) + c.monto)
  return [...sumas.entries()].map(([nombre, monto]) => ({ nombre, monto })).sort((a, b) => b.monto - a.monto)
}

// Primer día del primer mes del historial (hace 6 meses)
export const inicioHistorial = (hoy: Dayjs) => hoy.subtract(MESES_HISTORIAL - 1, 'month').startOf('month')

// Los números de arriba de todo: ingresos del mes, pendiente de cobro y promedio por trabajo
export function resumen(todos: Cobro[], hoy: Dayjs) {
  const mesAnterior = hoy.subtract(1, 'month')
  const ingresosMes = total(pagados(todos).filter((c) => mesDe(c) === hoy.format('YYYY-MM')))
  const ingresosMesAnterior = total(pagados(todos).filter((c) => mesDe(c) === mesAnterior.format('YYYY-MM')))
  // Pendiente de cobro: lo que el cliente todavía no pagó y lo que pagó pero falta depositar
  const pendientes = todos.filter((c) => c.estado === 'pendiente_cobro')
  const trabajosRecientes = pagados(todos).filter((c) => c.concepto === 'trabajo' && dayjs(c.fechaPago).isAfter(inicioHistorial(hoy)))
  return {
    mesAnterior,
    ingresosMes,
    // Cuánto subió o bajó respecto del mes anterior (null si el anterior no tuvo cobros)
    variacion: ingresosMesAnterior > 0 ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100) : null,
    pendientes,
    proximoDeposito: pendientes
      .filter((c) => c.depositoEstimado)
      .map((c) => dayjs(c.depositoEstimado))
      .sort((a, b) => a.valueOf() - b.valueOf())[0],
    trabajosRecientes,
    promedio: trabajosRecientes.length ? Math.round(total(trabajosRecientes) / trabajosRecientes.length) : 0,
  }
}

// Los cobros que se ven en un mes. Los que el cliente todavía no pagó se muestran en el mes actual
export function cobrosDelMes(todos: Cobro[], mes: Dayjs, hoy: Dayjs) {
  const esMesActual = mes.format('YYYY-MM') === hoy.format('YYYY-MM')
  return todos.filter((c) => (c.fechaPago == null ? esMesActual : mesDe(c) === mes.format('YYYY-MM')))
}

// Historial: lo cobrado en cada uno de los últimos 6 meses (trabajos y visitas por separado)
export function porMes(todos: Cobro[], hoy: Dayjs) {
  const meses = Array.from({ length: MESES_HISTORIAL }, (_, i) => hoy.subtract(MESES_HISTORIAL - 1 - i, 'month').startOf('month'))
  return meses.map((m) => {
    const lista = pagados(todos).filter((c) => mesDe(c) === m.format('YYYY-MM'))
    return {
      mes: m,
      trabajos: total(lista.filter((c) => c.concepto === 'trabajo')),
      visitas: total(lista.filter((c) => c.concepto === 'visita')),
      cantidad: lista.length,
      total: total(lista),
    }
  })
}
