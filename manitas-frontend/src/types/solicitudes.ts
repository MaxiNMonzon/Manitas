// Solicitudes de servicio: estados, la solicitud, avisos y urgencias

export type EstadoSolicitud =
  | 'solicitado'
  | 'presupuestado'
  | 'agendado'
  | 'contratado'
  | 'reprogramacion'
  | 'finalizado'
  | 'rechazado'
  | 'cancelado'
  | 'expirado'

export interface PersonaResumen {
  nombre: string
  apellido: string
  telefono: string
}

// El cliente tal como viene en las solicitudes del profesional (con su dirección y zona)
export interface ClienteDeSolicitud extends PersonaResumen {
  calle?: string
  altura?: number
  piso?: string | null
  depto?: string | null
  zonaResidencia?: { nombreZona: string } | null
}

// GET /solicitud-de-servicio (solo los campos que usa el front). Fechas en texto ISO
export interface SolicitudResumen {
  idSolicitud: number
  estadoServicio: EstadoSolicitud
  urgente: boolean
  descripcionProblema: string
  fechaSolicitud?: string
  fechaCambioEstado: string
  fechaVisita?: string | null
  fechaInicio?: string | null // inicio del trabajo
  fechaFinEstimada?: string | null
  costoVisita?: number | null
  costoEstimado: number | null // presupuesto aceptado
  costoFinal: number | null // lo que se cobra
  horasTrabajo?: number | null // cuántas horas lleva el trabajo (viene con el presupuesto)
  fechaFinReal: string | null // cuándo se terminó (al pagar)
  fechaPago?: string | null // cuándo pagó el cliente (con tarjeta o con Mercado Pago)
  especialidad: { nombreEspecialidad: string } | null
  fechaAceptacion?: string | null // cuándo el cliente aceptó el presupuesto (tiene 6 h para echarse atrás)
  propuestaDe?: 'cliente' | 'profesional' | null // en una reprogramación: quién propuso el horario nuevo
  estadoAnterior?: EstadoSolicitud | null // en una reprogramación: a qué estado vuelve
  calificacionServicio?: number | null // estrellas que puso el cliente (1 a 5)
  reseñaServicio?: string | null
  cliente?: ClienteDeSolicitud // viene cuando pregunta el profesional
  profesional?: ProfesionalDeSolicitud | null // viene cuando pregunta el cliente (vacío en una urgente sin tomar)
}

// El profesional tal como viene en las solicitudes del cliente
export interface ProfesionalDeSolicitud extends PersonaResumen {
  idUsuario: number
}

// POST /solicitud-de-servicio (el cliente pide presupuesto eligiendo el turno de la visita)
export interface NuevaSolicitud {
  idProfesional: number
  idEspecialidad: number
  descripcionProblema: string
  inicioTurno: Date
}

// GET /solicitud-de-servicio/avisos
export interface Aviso {
  idSolicitud: number
  mensaje: string
}

// GET /solicitud-de-servicio/urgentes (profesional): urgentes cerca que nadie tomó
export interface UrgenteDisponible {
  idSolicitud: number
  especialidad: string
  descripcionProblema: string
  zona: string
  cliente: string // solo el nombre
  minutosQueQuedan: number
}
