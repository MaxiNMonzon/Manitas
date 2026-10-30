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
  // Separadas por coma (ej: "caño, canilla, pérdida"); las usa el buscador del cliente
  palabrasClave?: string | null
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
  matriculas?: MatriculaRequest[]
  cbu?: string // CBU/CVU: 22 números
  descripcion?: string // "Sobre mí"
  idsEspecialidades: number[]
  idsTiposDeServicio: number[] // habilidades
  idsZonasCobertura: number[]
}

// Una matrícula del profesional, de una de sus especialidades
export interface MatriculaRequest {
  numero: string
  descripcion?: string
  idEspecialidad: number
}

// ---------- Solicitudes ----------

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

// GET /turnos/libres/:idProfesional?desde=&hasta= (fechas en texto ISO). Franjas de una hora
export interface TurnoLibre {
  inicio: string
  fin: string
}

// GET /profesional?especialidad=&zona= (solo los campos que usa el front)
export interface ProfesionalApi {
  idUsuario: number
  nombre: string
  apellido: string
  costoVisita?: number | null
  descripcion?: string | null
  especialidades: { idEspecialidad: number; nombreEspecialidad: string }[]
  zonasDeCobertura: { idZona: number; nombreZona: string }[]
  // Sus habilidades (tipos de servicio)
  tiposDeServicio?: { idServicio: number; nombreServicio: string }[]
}

// GET /profesional/:id/calificaciones (con las reseñas)
export interface CalificacionesDetalle extends Calificaciones {
  reseñas: { calificacion: number; reseña: string | null; fecha: string | null; cliente: string }[]
}

// POST /solicitud-de-servicio (el cliente pide presupuesto eligiendo el turno de la visita)
export interface NuevaSolicitud {
  idProfesional: number
  idEspecialidad: number
  descripcionProblema: string
  inicioTurno: Date
}

// GET / PUT /turnos/mi-horario: el horario fijo del profesional (0 = domingo ... 6 = sábado).
// Ej: lunes de 9 a 18 = { diaSemana: 1, horaDesde: 9, horaHasta: 18 } → turnos de 9 a 17
export interface RangoHorario {
  diaSemana: number
  horaDesde: number
  horaHasta: number
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

// GET /auth/perfil del profesional (sin la contraseña)
export interface PerfilProfesional {
  idUsuario: number
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // 'AAAA-MM-DD'
  correo: string
  telefono: string
  matriculas: { idMatricula?: number; numero: string; descripcion?: string | null; especialidad: { idEspecialidad: number; nombreEspecialidad: string } }[]
  costoVisita?: number | null
  descripcion?: string | null
  cbu?: string | null
  especialidades: { idEspecialidad: number; nombreEspecialidad: string }[]
  tiposDeServicio: { idServicio: number; nombreServicio: string; especialidad?: { idEspecialidad: number; nombreEspecialidad: string } }[]
  zonasDeCobertura: { idZona: number; nombreZona: string; localidad?: { nombreLocalidad: string } }[]
}

// PATCH /profesional/:id (null = borrar el dato opcional)
export interface CambiosPerfilProfesional {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  matriculas: MatriculaRequest[]
  costoVisita: number | null
  descripcion: string | null
  cbu: string | null
  idsEspecialidades: number[]
  idsTiposDeServicio: number[]
  idsZonasCobertura: number[]
}

// GET /auth/perfil del cliente (sin la contraseña)
export interface PerfilCliente {
  idUsuario: number
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // 'AAAA-MM-DD'
  correo: string
  telefono: string
  calle: string
  altura: number
  piso?: string | null
  depto?: string | null
  zonaResidencia: {
    idZona: number
    nombreZona: string
    localidad: {
      idLocalidad: number
      codigoPostal: string | null
      nombreLocalidad: string
      provincia: {
        idProvincia: number
        nombreProvincia: string
      }
    }
  }
}

// PATCH /cliente/:id (null = borrar el dato opcional)
export interface CambiosPerfilCliente {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  calle: string
  altura: number
  piso: string | null
  depto: string | null
  idZonaResidencia: number
}