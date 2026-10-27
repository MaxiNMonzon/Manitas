// Llamadas al back sobre solicitudes, agenda y avisos.
// Con la sesión demo (provisoria) devuelven datos mock en vez de llamar a la API.
import { api, tokenStorage } from './client'
import type {
  Aviso,
  Calificaciones,
  EventoAgenda,
  NuevaSolicitud,
  ProfesionalDeSolicitud,
  Rol,
  SolicitudResumen,
  TurnoLibre,
  UrgenteDisponible,
} from '../types'
import {
  aceptarDemo,
  agendarDemo,
  eventosDemo,
  presupuestarDemo,
  propuestaProfesionalDemo,
  rechazarDemo,
  reprogramarProfesionalDemo,
  responderReprogramacionProfesionalDemo,
  solicitudesDemo,
  urgentesDemo,
} from '../mocks/agendaProfesional'
import {
  aceptarPresupuestoDemo,
  calificarDemo,
  cancelarDemo,
  crearSolicitudDemo,
  crearUrgenteDemo,
  propuestaDemo,
  rechazarPresupuestoDemo,
  reprogramarClienteDemo,
  responderReprogramacionDemo,
  solicitudesClienteDemo,
  turnosLibresDemo,
} from '../mocks/solicitudesCliente'
import { avisosDemo } from '../mocks/avisos'
import { profesionalDemo } from '../mocks/espejoDemo'

// La API manda las fechas como texto (ISO); acá se pasan a Date
type EventoAgendaApi = Omit<EventoAgenda, 'inicio' | 'fin'> & { inicio: string; fin: string }

// desde / hasta: 'AAAA-MM-DD', los dos días incluidos
export async function traerAgenda(desde: string, hasta: string): Promise<EventoAgenda[]> {
  if (tokenStorage.esDemo()) {
    const d = new Date(`${desde}T00:00:00`)
    const h = new Date(`${hasta}T23:59:59`)
    return eventosDemo.filter((e) => e.inicio >= d && e.inicio <= h).sort((a, b) => +a.inicio - +b.inicio)
  }
  const eventos = await api.get<EventoAgendaApi[]>(`/solicitud-de-servicio/agenda?desde=${desde}&hasta=${hasta}`)
  return eventos.map((e) => ({ ...e, inicio: new Date(e.inicio), fin: new Date(e.fin) }))
}

export async function traerMisSolicitudes(): Promise<SolicitudResumen[]> {
  if (tokenStorage.esDemo()) return solicitudesDemo
  return api.get<SolicitudResumen[]>('/solicitud-de-servicio')
}

// Profesional: urgentes de sus especialidades y zonas que nadie tomó todavía
export async function traerUrgentes(): Promise<UrgenteDisponible[]> {
  if (tokenStorage.esDemo()) return urgentesDemo
  return api.get<UrgenteDisponible[]>('/solicitud-de-servicio/urgentes')
}

// Profesional: aceptar una solicitud (en una urgente, el primero que acepta se la queda).
// Una urgente no se agenda: se manda en cuántos minutos llega y queda agendada para ese momento
export async function aceptarSolicitud(idSolicitud: number, minutosLlegada?: number): Promise<void> {
  if (tokenStorage.esDemo()) return aceptarDemo(idSolicitud, minutosLlegada)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/aceptar`, minutosLlegada ? { minutosLlegada } : {})
}

// Profesional: rechazar una solicitud nueva (ej: no hace ese trabajo)
export async function rechazarSolicitud(idSolicitud: number): Promise<void> {
  if (tokenStorage.esDemo()) return rechazarDemo(idSolicitud)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/rechazar`, {})
}

// Profesional: mandar el presupuesto después de la visita (o cambiar el precio a mitad del trabajo).
// horasTrabajo: obligatorio en el primer presupuesto (con eso el cliente elige desde cuándo arranca
// y se reservan esas horas seguidas); en un cambio de precio no se manda
export async function presupuestar(idSolicitud: number, costo: number, horasTrabajo?: number): Promise<void> {
  if (tokenStorage.esDemo()) return presupuestarDemo(idSolicitud, costo, horasTrabajo)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/presupuestar`, horasTrabajo ? { costo, horasTrabajo } : { costo })
}

// Profesional: proponer otro horario (a una nueva, a la visita o al trabajo). Le toca contestar al cliente
export async function reprogramarComoProfesional(idSolicitud: number, inicio: Date): Promise<void> {
  if (tokenStorage.esDemo()) return reprogramarProfesionalDemo(idSolicitud, inicio)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/reprogramar`, { inicio: fechaLocal(inicio) })
}

// Profesional: contestar el horario que propuso el cliente (mismo endpoint que el cliente; la demo usa otros datos)
export async function responderReprogramacionProfesional(idSolicitud: number, acepta: boolean): Promise<void> {
  if (tokenStorage.esDemo()) return responderReprogramacionProfesionalDemo(idSolicitud, acepta)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/${acepta ? 'aceptar' : 'rechazar'}-reprogramacion`, {})
}

export async function traerHorarioPropuestoProfesional(idSolicitud: number): Promise<Date | null> {
  if (tokenStorage.esDemo()) return propuestaProfesionalDemo(idSolicitud)
  return horarioPropuesto(idSolicitud)
}

// Profesional: su propio id (el token no lo trae); hace falta para ver sus turnos libres
export async function traerMiIdProfesional(): Promise<number> {
  if (tokenStorage.esDemo()) return profesionalDemo.idUsuario
  const { idUsuario } = await api.get<{ idUsuario: number }>('/auth/perfil')
  return idUsuario
}

// fecha: Date con día y hora local. Se manda sin zona horaria ("2026-10-20T10:00:00"),
// que el back interpreta en hora local (Argentina), igual que el ejemplo de Swagger
export async function agendar(idSolicitud: number, fecha: Date, duracionMinutos: number): Promise<void> {
  if (tokenStorage.esDemo()) return agendarDemo(idSolicitud, fecha, duracionMinutos)
  const p = (n: number) => String(n).padStart(2, '0')
  const local = `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/agendar`, { fecha: local, duracionEstimada: duracionMinutos })
}

// Profesional: su promedio de estrellas. El token no trae el id, así que primero se pide el perfil
export async function traerMiCalificacion(): Promise<Calificaciones> {
  if (tokenStorage.esDemo()) return { promedio: 4.6, cantidad: 23 }
  const { idUsuario } = await api.get<{ idUsuario: number }>('/auth/perfil')
  return api.get<Calificaciones>(`/profesional/${idUsuario}/calificaciones`)
}

export async function traerAvisos(rol: Rol): Promise<Aviso[]> {
  if (tokenStorage.esDemo()) return avisosDemo[rol]
  return api.get<Aviso[]>('/solicitud-de-servicio/avisos')
}

// ---------- Cliente ----------

// Las solicitudes del cliente logueado (con el profesional de cada una)
export async function traerSolicitudesCliente(): Promise<SolicitudResumen[]> {
  if (tokenStorage.esDemo()) return solicitudesClienteDemo
  return api.get<SolicitudResumen[]>('/solicitud-de-servicio')
}

// Cliente: pedir presupuesto a un profesional, con el turno de la visita (uno de sus libres).
// Datos extra (`demo`) solo para que la sesión demo pueda mostrarla en la lista
export async function crearSolicitud(
  nueva: NuevaSolicitud,
  demo: { profesional: ProfesionalDeSolicitud; especialidad: string; costoVisita: number | null },
): Promise<void> {
  if (tokenStorage.esDemo()) {
    return crearSolicitudDemo({ ...demo, descripcionProblema: nueva.descripcionProblema, inicioTurno: nueva.inicioTurno })
  }
  await api.post('/solicitud-de-servicio', {
    idProfesional: nueva.idProfesional,
    idEspecialidad: nueva.idEspecialidad,
    descripcionProblema: nueva.descripcionProblema,
    inicioTurno: fechaLocal(nueva.inicioTurno),
  })
}

// Cliente: urgencia. Sin elegir profesional ni turno: le aparece a los de esa especialidad en su zona
export async function crearUrgente(idEspecialidad: number, descripcionProblema: string, nombreEspecialidad: string): Promise<void> {
  if (tokenStorage.esDemo()) return crearUrgenteDemo(nombreEspecialidad, descripcionProblema)
  await api.post('/solicitud-de-servicio/urgente', { idEspecialidad, descripcionProblema })
}

// Cliente: proponer otro horario para la visita o el trabajo (hasta 12 h antes). Le toca contestar al profesional
export async function reprogramarComoCliente(idSolicitud: number, inicio: Date): Promise<void> {
  if (tokenStorage.esDemo()) return reprogramarClienteDemo(idSolicitud, inicio)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/reprogramar`, { inicio: fechaLocal(inicio) })
}

// Cliente: aceptar el presupuesto. inicioTrabajo = null → se hace en el momento, en la visita
export async function aceptarPresupuesto(idSolicitud: number, inicioTrabajo: Date | null): Promise<void> {
  if (tokenStorage.esDemo()) return aceptarPresupuestoDemo(idSolicitud, inicioTrabajo)
  await api.patch(
    `/solicitud-de-servicio/${idSolicitud}/aceptar-presupuesto`,
    inicioTrabajo ? { inicioTrabajo: fechaLocal(inicioTrabajo) } : { enElMomento: true },
  )
}

// Cliente: rechazar el presupuesto (si el profesional cobra la visita, queda para pagar eso)
export async function rechazarPresupuesto(idSolicitud: number): Promise<void> {
  if (tokenStorage.esDemo()) return rechazarPresupuestoDemo(idSolicitud)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/rechazar-presupuesto`, {})
}

export async function cancelarSolicitud(idSolicitud: number): Promise<void> {
  if (tokenStorage.esDemo()) return cancelarDemo(idSolicitud)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/cancelar`, {})
}

// Cliente: de 1 a 5 estrellas y una reseña opcional (una sola vez, en una finalizada)
export async function calificarServicio(idSolicitud: number, estrellas: number, reseña: string): Promise<void> {
  if (tokenStorage.esDemo()) return calificarDemo(idSolicitud, estrellas, reseña)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/calificar`, {
    calificacionServicio: estrellas,
    ...(reseña.trim() ? { reseñaServicio: reseña.trim() } : {}),
  })
}

// Responder al horario nuevo que propuso la otra persona
export async function responderReprogramacion(idSolicitud: number, acepta: boolean): Promise<void> {
  if (tokenStorage.esDemo()) return responderReprogramacionDemo(idSolicitud, acepta)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/${acepta ? 'aceptar' : 'rechazar'}-reprogramacion`, {})
}

// El horario propuesto en una reprogramación (sale del detalle: GET /:id trae los turnos propuestos)
export async function traerHorarioPropuesto(idSolicitud: number): Promise<Date | null> {
  if (tokenStorage.esDemo()) return propuestaDemo(idSolicitud)
  return horarioPropuesto(idSolicitud)
}

async function horarioPropuesto(idSolicitud: number): Promise<Date | null> {
  const detalle = await api.get<{ turnosPropuestos?: TurnoLibre[] }>(`/solicitud-de-servicio/${idSolicitud}`)
  const primero = detalle.turnosPropuestos?.[0]
  return primero ? new Date(primero.inicio) : null
}

// Turnos libres de un profesional. desde / hasta: 'AAAA-MM-DD', los dos días incluidos (hasta 31 días)
export async function traerTurnosLibres(idProfesional: number, desde: string, hasta: string): Promise<TurnoLibre[]> {
  if (tokenStorage.esDemo()) return turnosLibresDemo(desde, hasta)
  return api.get<TurnoLibre[]>(`/turnos/libres/${idProfesional}?desde=${desde}&hasta=${hasta}`)
}

// Fecha y hora local sin zona horaria ("2026-10-20T10:00:00"), como la espera el back
function fechaLocal(fecha: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`
}