// Llamadas al back sobre solicitudes, agenda y avisos.
// Con la sesión demo (provisoria) devuelven datos mock en vez de llamar a la API.
import { api, tokenStorage } from './client'
import type { Aviso, EventoAgenda, Rol, SolicitudResumen } from '../types'
import { agendarDemo, eventosDemo, pendientesDemo } from '../mocks/agendaProfesional'
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
  if (tokenStorage.esDemo()) return pendientesDemo
  return api.get<SolicitudResumen[]>('/solicitud-de-servicio')
}

// fecha: Date con día y hora local. Se manda sin zona horaria ("2026-10-20T10:00:00"),
// que el back interpreta en hora local (Argentina), igual que el ejemplo de Swagger
export async function agendar(idSolicitud: number, fecha: Date, duracionMinutos: number): Promise<void> {
  if (tokenStorage.esDemo()) return agendarDemo(idSolicitud, fecha, duracionMinutos)
  const p = (n: number) => String(n).padStart(2, '0')
  const local = `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`
  await api.patch(`/solicitud-de-servicio/${idSolicitud}/agendar`, { fecha: local, duracionEstimada: duracionMinutos })
}

export async function traerAvisos(rol: Rol): Promise<Aviso[]> {
  if (tokenStorage.esDemo()) return avisosDemo[rol]
  return api.get<Aviso[]>('/solicitud-de-servicio/avisos')
}
