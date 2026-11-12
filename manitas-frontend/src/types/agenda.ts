// Turnos y agenda: turnos libres, horario fijo del profesional y eventos del calendario
import type { EstadoSolicitud, PersonaResumen } from './solicitudes'

// GET /turnos/libres/:idProfesional?desde=&hasta= (fechas en texto ISO). Franjas de una hora
export interface TurnoLibre {
  inicio: string
  fin: string
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