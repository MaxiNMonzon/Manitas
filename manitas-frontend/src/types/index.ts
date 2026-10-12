// Tipos de las respuestas del backend (manitas-backend).
// Ver la documentacion completa en http://localhost:3000/api

export type Rol = 'cliente' | 'profesional' | 'admin'

// POST /auth/login/{cliente|profesional|admin}
export interface LoginRequest {
  correo: string
  contraseña: string
}

export interface LoginResponse {
  token: string
  correo: string
}

// Catálogos de ubicación: GET /provincia, /localidad?provincia=, /zona?localidad=
export interface Provincia {
  idProvincia: number
  nombreProvincia: string
}

export interface Localidad {
  idLocalidad: number
  codigoPostal: string | null
  nombreLocalidad: string
}

export interface Zona {
  idZona: number
  nombreZona: string
}

// POST /auth/register/cliente
export interface RegistroClienteRequest {
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  correo: string
  contraseña: string
  telefono: string
  calle: string
  altura: number
  piso?: string // opcional, solo departamentos
  depto?: string
  idZonaResidencia: number
}

// Catálogos de oficios: GET /especialidad, /tipos-de-servicio
export interface Especialidad {
  idEspecialidad: number
  nombreEspecialidad: string
  descripcionEspecialidad: string
}

// En el registro de profesional se muestran como "Habilidades"
export interface TipoDeServicio {
  idServicio: number
  nombreServicio: string
  descripcionServicio: string
  especialidad: Especialidad
}

// POST /auth/register/profesional
export interface RegistroProfesionalRequest {
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  correo: string
  contraseña: string
  telefono: string
  nroMatricula?: string
  cbu?: string // CBU/CVU: 22 números
  descripcion?: string // "Sobre mí"
  idsEspecialidades: number[]
  idsTiposDeServicio: number[] // habilidades
  idsZonasCobertura: number[]
}

// ---------- Solicitudes ----------

export type EstadoSolicitud =
  | 'solicitado'
  | 'en_coordinacion'
  | 'presupuestado'
  | 'agendado'
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
  fechaFinReal: string | null // cuándo se terminó (al pagar)
  especialidad: { nombreEspecialidad: string } | null
  cliente?: ClienteDeSolicitud // viene cuando pregunta el profesional
  profesional?: PersonaResumen | null // viene cuando pregunta el cliente
}

// GET /solicitud-de-servicio/agenda?desde=&hasta= (las fechas ya convertidas a Date)
export interface EventoAgenda {
  idSolicitud: number
  tipo: 'visita' | 'trabajo'
  inicio: Date
  fin: Date
  estado: EstadoSolicitud
  urgente: boolean
  especialidad: string | null
  descripcionProblema: string
  con: PersonaResumen | null // la otra persona
  direccion: string | null // solo para el profesional
  zona: string | null
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

// GET /profesional/:id/calificaciones (solo lo que usa el front)
export interface Calificaciones {
  promedio: number | null // 1 decimal; null si todavía no tiene
  cantidad: number
}

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
  medioDePago: string | null // solo el tipo (ej: "Visa crédito Banco Nación"), nunca los números
  especialidad: string | null
  descripcionProblema: string
  cliente: { nombre: string; apellido: string }
  fechaServicio: string | null
}

export interface MisCobros {
  cuentaDeposito: string | null // últimos 4 números del CBU/CVU
  cobros: Cobro[]
}
