// Llamadas al back sobre solicitudes, agenda y avisos.
import { api } from './client'
import { registrarMiAccion } from './misAcciones'
import type { Aviso, Calificaciones, EventoAgenda, NuevaSolicitud, SolicitudResumen, TurnoLibre, UrgenteDisponible } from '../types'

// La API manda las fechas como texto (ISO); acá se pasan a Date
type EventoAgendaApi = Omit<EventoAgenda, 'inicio' | 'fin'> & { inicio: string; fin: string }

// desde / hasta: 'AAAA-MM-DD', los dos días incluidos
export async function traerAgenda(desde: string, hasta: string): Promise<EventoAgenda[]> {
  const eventos = await api.get<EventoAgendaApi[]>(`/solicitud-de-servicio/agenda?desde=${desde}&hasta=${hasta}`)
  return eventos.map((e) => ({ ...e, inicio: new Date(e.inicio), fin: new Date(e.fin) }))
}

export async function traerMisSolicitudes(): Promise<SolicitudResumen[]> {
  return api.get<SolicitudResumen[]>('/solicitud-de-servicio')
}

// Profesional: urgentes de sus especialidades y zonas que nadie tomó todavía
export async function traerUrgentes(): Promise<UrgenteDisponible[]> {
  return api.get<UrgenteDisponible[]>('/solicitud-de-servicio/urgentes')
}

// Profesional: aceptar una solicitud (en una urgente, el primero que acepta se la queda).
// Una urgente no se agenda: se manda en cuántos minutos llega y queda agendada para ese momento
export async function aceptarSolicitud(idSolicitud: number, minutosLlegada?: number): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/aceptar`, minutosLlegada ? { minutosLlegada } : {})
  registrarMiAccion(idSolicitud)
}

// Profesional: rechazar una solicitud nueva (ej: no hace ese trabajo)
export async function rechazarSolicitud(idSolicitud: number): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/rechazar`, {})
  registrarMiAccion(idSolicitud)
}

// Profesional: mandar el presupuesto después de la visita (o cambiar el precio a mitad del trabajo).
// horasTrabajo: obligatorio en el primer presupuesto (con eso el cliente elige desde cuándo arranca
// y se reservan esas horas seguidas); en un cambio de precio no se manda
export async function presupuestar(idSolicitud: number, costo: number, horasTrabajo?: number): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/presupuestar`, horasTrabajo ? { costo, horasTrabajo } : { costo })
  registrarMiAccion(idSolicitud)
}

// Profesional: proponer otro horario (a una nueva, a la visita o al trabajo). Le toca contestar al cliente
export async function reprogramarComoProfesional(idSolicitud: number, inicio: Date): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/reprogramar`, { inicio: fechaLocal(inicio) })
  registrarMiAccion(idSolicitud)
}

// Profesional: contestar el horario que propuso el cliente (mismo endpoint que el cliente)
export async function responderReprogramacionProfesional(idSolicitud: number, acepta: boolean): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/${acepta ? 'aceptar' : 'rechazar'}-reprogramacion`, {})
  registrarMiAccion(idSolicitud)
}

export async function traerHorarioPropuestoProfesional(idSolicitud: number): Promise<Date | null> {
  return horarioPropuesto(idSolicitud)
}

// Profesional: su propio id (el token no lo trae); hace falta para ver sus turnos libres
export async function traerMiIdProfesional(): Promise<number> {
  const { idUsuario } = await api.get<{ idUsuario: number }>('/auth/perfil')
  return idUsuario
}

// Profesional: su promedio de estrellas. El token no trae el id, así que primero se pide el perfil
export async function traerMiCalificacion(): Promise<Calificaciones> {
  const { idUsuario } = await api.get<{ idUsuario: number }>('/auth/perfil')
  return api.get<Calificaciones>(`/profesional/${idUsuario}/calificaciones`)
}

// Los avisos de la persona logueada (el back sabe su rol por el token)
export async function traerAvisos(): Promise<Aviso[]> {
  return api.get<Aviso[]>('/solicitud-de-servicio/avisos')
}

// ---------- Cliente ----------

// Las solicitudes del cliente logueado (con el profesional de cada una)
export async function traerSolicitudesCliente(): Promise<SolicitudResumen[]> {
  return api.get<SolicitudResumen[]>('/solicitud-de-servicio')
}

// Cliente: pedir presupuesto a un profesional, con el turno de la visita (uno de sus libres).
export async function crearSolicitud(nueva: NuevaSolicitud): Promise<void> {
  await api.post('/solicitud-de-servicio', {
    idProfesional: nueva.idProfesional,
    idEspecialidad: nueva.idEspecialidad,
    descripcionProblema: nueva.descripcionProblema,
    inicioTurno: fechaLocal(nueva.inicioTurno),
  })
}

// Cliente: urgencia. Sin elegir profesional ni turno: le aparece a los de esa especialidad en su zona
export async function crearUrgente(idEspecialidad: number, descripcionProblema: string): Promise<void> {
  await api.post('/solicitud-de-servicio/urgente', { idEspecialidad, descripcionProblema })
}

// Cliente: proponer otro horario para la visita o el trabajo (hasta 12 h antes). Le toca contestar al profesional
export async function reprogramarComoCliente(idSolicitud: number, inicio: Date): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/reprogramar`, { inicio: fechaLocal(inicio) })
  registrarMiAccion(idSolicitud)
}

// Cliente: aceptar el presupuesto. inicioTrabajo = null → se hace en el momento, en la visita
export async function aceptarPresupuesto(idSolicitud: number, inicioTrabajo: Date | null): Promise<void> {
  await api.patch(
    `/solicitud-de-servicio/${idSolicitud}/aceptar-presupuesto`,
    inicioTrabajo ? { inicioTrabajo: fechaLocal(inicioTrabajo) } : { enElMomento: true },
  )
  registrarMiAccion(idSolicitud)
}

// Cliente: rechazar el presupuesto (si el profesional cobra la visita, queda para pagar eso)
export async function rechazarPresupuesto(idSolicitud: number): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/rechazar-presupuesto`, {})
  registrarMiAccion(idSolicitud)
}

export async function cancelarSolicitud(idSolicitud: number): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/cancelar`, {})
  registrarMiAccion(idSolicitud)
}

// Cliente: de 1 a 5 estrellas y una reseña opcional (una sola vez, en una finalizada)
export async function calificarServicio(idSolicitud: number, estrellas: number, reseña: string): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/calificar`, {
    calificacionServicio: estrellas,
    ...(reseña.trim() ? { reseñaServicio: reseña.trim() } : {}),
  })
}

// Responder al horario nuevo que propuso la otra persona
export async function responderReprogramacion(idSolicitud: number, acepta: boolean): Promise<void> {
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/${acepta ? 'aceptar' : 'rechazar'}-reprogramacion`, {})
  registrarMiAccion(idSolicitud)
}

// El horario propuesto en una reprogramación (sale del detalle: GET /:id trae los turnos propuestos)
export async function traerHorarioPropuesto(idSolicitud: number): Promise<Date | null> {
  return horarioPropuesto(idSolicitud)
}

async function horarioPropuesto(idSolicitud: number): Promise<Date | null> {
  const detalle = await api.get<{ turnosPropuestos?: TurnoLibre[] }>(`/solicitud-de-servicio/${idSolicitud}`)
  const primero = detalle.turnosPropuestos?.[0]
  return primero ? new Date(primero.inicio) : null
}

// Turnos libres de un profesional. desde / hasta: 'AAAA-MM-DD', los dos días incluidos (hasta 3 meses)
export async function traerTurnosLibres(idProfesional: number, desde: string, hasta: string): Promise<TurnoLibre[]> {
  return api.get<TurnoLibre[]>(`/turnos/libres/${idProfesional}?desde=${desde}&hasta=${hasta}`)
}

// Fecha y hora local sin zona horaria ("2026-10-20T10:00:00"), como la espera el back
function fechaLocal(fecha: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`
}
