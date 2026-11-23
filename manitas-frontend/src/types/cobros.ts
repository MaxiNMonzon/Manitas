// Cobros del profesional

// GET /solicitud-de-servicio/cobros (profesional)
// pendiente_cobro: el cliente todavía no pagó, o pagó y falta el depósito (3 días hábiles); cobrado: depositado.
// Si ya pagó, tiene fechaPago
export type EstadoCobro = 'pendiente_cobro' | 'cobrado'

export interface Cobro {
  idSolicitud: number
  concepto: 'trabajo' | 'visita' // la visita se cobra si el cliente rechaza el presupuesto
  estado: EstadoCobro
  monto: number
  fechaPago: string | null
  depositoEstimado: string | null
  medioDePago: string | null // con qué se pagó (hoy siempre "Mercado Pago")
  especialidad: string | null
  descripcionProblema: string
  cliente: { nombre: string; apellido: string }
  fechaServicio: string | null
}

// Las cuentas de un mes, hechas por el back
export interface CobrosDelMes {
  mes: string // "2026-11"
  trabajos: number
  visitas: number
  cantidad: number
  total: number // lo cobrado en el mes
  variacion: number | null // % respecto del mes anterior
  cobrado: number // para la barra del mes (lo que espera el pago cuenta en el mes actual)
  pendiente: number
}

// Una parte de una torta (por especialidad o por medio de pago)
export interface PorcionCobros {
  nombre: string
  monto: number
  porcentaje: number
}

// Todas las cuentas de "Mis cobros": las hace el back, el front solo las muestra
export interface ResumenCobros {
  mesActual: string
  ingresosMes: number
  variacionMes: number | null
  pendiente: { monto: number; cantidad: number; proximoDeposito: string | null }
  promedioPorTrabajo: { monto: number; trabajos: number; meses: number }
  meses: CobrosDelMes[] // del más viejo al actual (los últimos 6 son el historial)
  porEspecialidad: PorcionCobros[]
  porMedioDePago: PorcionCobros[]
}

export interface MisCobros {
  cuentaDeposito: string | null // últimos 4 números del CBU/CVU
  cobros: Cobro[]
  resumen: ResumenCobros
}