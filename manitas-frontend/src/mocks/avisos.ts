// DATOS MOCK de los avisos (campanita), solo para la sesión demo.
// Con sesión real se usa GET /solicitud-de-servicio/avisos.
import type { Aviso, Rol } from '../types'

export const avisosDemo: Record<Rol, Aviso[]> = {
  cliente: [
    { idSolicitud: 4, mensaje: 'Pedro acepto tu urgencia y va en camino: llega a las 16:30 (en 25 minutos)' },
    { idSolicitud: 1, mensaje: 'Tenes una visita con Elvio el 13/10, 10:00' },
    { idSolicitud: 2, mensaje: 'Oscar te mando un presupuesto de $25000' },
    { idSolicitud: 3, mensaje: '¿Como te fue con Marta? Calificala' },
  ],
  profesional: [
    { idSolicitud: 104, mensaje: 'URGENTE de Plomería en Centro: se rompió un caño. Quedan 42 minutos' },
    { idSolicitud: 102, mensaje: 'Tenes una visita con Sofía hoy a las 09:00' },
    { idSolicitud: 201, mensaje: 'Acordate de cargar la fecha de la solicitud de Laura. Te quedan 43 hs antes de que venza' },
  ],
  admin: [],
}
