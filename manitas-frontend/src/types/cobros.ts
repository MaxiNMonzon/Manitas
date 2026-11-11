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

export interface MisCobros {
  cuentaDeposito: string | null // últimos 4 números del CBU/CVU
  cobros: Cobro[]
}
