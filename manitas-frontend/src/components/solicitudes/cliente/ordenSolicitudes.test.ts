import { describe, expect, it } from 'vitest'
import { cuantasEsperanRespuesta, delGrupo, ordenar } from './ordenSolicitudes'
import { accionesDelDetalle } from './acciones'
import type { SolicitudResumen } from '../../../types'

// Una solicitud como la que devuelve GET /solicitud-de-servicio al cliente
function solicitud(datos: Partial<SolicitudResumen>): SolicitudResumen {
  return {
    idSolicitud: 1,
    estadoServicio: 'solicitado',
    urgente: false,
    descripcionProblema: 'Pierde la canilla',
    fechaCambioEstado: '2026-11-01T10:00:00',
    fechaVisita: null,
    costoEstimado: null,
    costoFinal: null,
    fechaFinReal: null,
    ...datos,
  } as SolicitudResumen
}

describe('Mis solicitudes del cliente', () => {
  it('separa las que siguen en curso de las terminadas', () => {
    const todas = [
      solicitud({ idSolicitud: 1, estadoServicio: 'agendado' }),
      solicitud({ idSolicitud: 2, estadoServicio: 'finalizado' }),
      solicitud({ idSolicitud: 3, estadoServicio: 'cancelado' }),
    ]
    expect(delGrupo(todas, 'en_curso').map((s) => s.idSolicitud)).toEqual([1])
    expect(delGrupo(todas, 'completadas').map((s) => s.idSolicitud)).toEqual([2, 3])
  })

  it('en curso pone arriba lo que espera una respuesta del cliente', () => {
    const lista = [
      solicitud({ idSolicitud: 1, estadoServicio: 'agendado', fechaVisita: '2026-11-20T10:00:00' }),
      solicitud({ idSolicitud: 2, estadoServicio: 'presupuestado', costoEstimado: 45000 }),
    ]
    expect(ordenar('en_curso', lista).map((s) => s.idSolicitud)).toEqual([2, 1])
    expect(cuantasEsperanRespuesta(lista)).toBe(1)
  })

  it('completadas pone arriba la más reciente', () => {
    const lista = [
      solicitud({ idSolicitud: 1, estadoServicio: 'finalizado', fechaFinReal: '2026-10-01T10:00:00' }),
      solicitud({ idSolicitud: 2, estadoServicio: 'finalizado', fechaFinReal: '2026-10-20T10:00:00' }),
    ]
    expect(ordenar('completadas', lista).map((s) => s.idSolicitud)).toEqual([2, 1])
  })

  it('un presupuesto recibido se puede aceptar o rechazar', () => {
    const acciones = accionesDelDetalle(solicitud({ estadoServicio: 'presupuestado', costoEstimado: 45000 }))
    expect(acciones).toContain('rechazarPresupuesto')
    expect(acciones).toContain('aceptarPresupuesto')
  })

  it('un trabajo finalizado sin calificar se puede calificar, y ya calificado no', () => {
    expect(accionesDelDetalle(solicitud({ estadoServicio: 'finalizado' }))).toContain('calificar')
    expect(accionesDelDetalle(solicitud({ estadoServicio: 'finalizado', calificacionServicio: 5 }))).not.toContain('calificar')
  })

  it('si el profesional propone otro horario, el cliente lo puede aceptar', () => {
    const s = solicitud({ estadoServicio: 'reprogramacion', propuestaDe: 'profesional' })
    expect(accionesDelDetalle(s)).toContain('aceptarHorario')
  })
})