// Llamadas al back sobre solicitudes, agenda y avisos.
// Con la sesión demo (provisoria) devuelven datos mock en vez de llamar a la API.
import { api, tokenStorage } from './client'
import type { Aviso, Calificaciones, EventoAgenda, Rol, SolicitudResumen, UrgenteDisponible } from '../types'
import { aceptarDemo, agendarDemo, eventosDemo, presupuestarDemo, rechazarDemo, solicitudesDemo, urgentesDemo } from '../mocks/agendaProfesional'
import { avisosDemo } from '../mocks/avisos'

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

// Profesional: mandar el presupuesto después de la visita (o cambiar el precio a mitad del trabajo)
export async function presupuestar(idSolicitud: number, costo: number): Promise<void> {
  if (tokenStorage.esDemo()) return presupuestarDemo(idSolicitud, costo)
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/presupuestar`, { costo })
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