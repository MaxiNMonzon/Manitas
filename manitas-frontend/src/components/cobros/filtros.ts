// Los filtros de la lista de "Mis cobros". Acá no se hace ninguna cuenta de plata:
// los totales, promedios y porcentajes los calcula el back (vienen en el "resumen" de GET /cobros).
import type { Dayjs } from 'dayjs'
import { mesDe } from './estadosCobro'
import type { Cobro, EstadoCobro } from '../../types'

// Vacío = sin filtrar por eso
export interface Filtros {
  estados: EstadoCobro[]
  conceptos: Cobro['concepto'][]
  especialidades: string[]
}
export const SIN_FILTROS: Filtros = { estados: [], conceptos: [], especialidades: [] }

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

export function pasaFiltros(cobro: Cobro, filtros: Filtros): boolean {
  return (
    (filtros.estados.length === 0 || filtros.estados.includes(cobro.estado)) &&
    (filtros.conceptos.length === 0 || filtros.conceptos.includes(cobro.concepto)) &&
    (filtros.especialidades.length === 0 || filtros.especialidades.includes(cobro.especialidad ?? ''))
  )
}

export const cantidadDeFiltros = (filtros: Filtros) => filtros.estados.length + filtros.conceptos.length + filtros.especialidades.length

// Los cobros que se listan en un mes. Los que el cliente todavía no pagó se muestran en el mes actual
export function cobrosDelMes(todos: Cobro[], mes: Dayjs, hoy: Dayjs) {
  const esMesActual = mes.format('YYYY-MM') === hoy.format('YYYY-MM')
  return todos.filter((c) => (c.fechaPago == null ? esMesActual : mesDe(c) === mes.format('YYYY-MM')))
}