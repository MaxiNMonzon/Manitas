import { describe, expect, it } from 'vitest'
import { delGrupo, enCarpetas, ordenar, URGENTES } from './ordenSolicitudes'
import { accionesDelDetalle } from './acciones'
import type { SolicitudResumen } from '../../../types'

// Una solicitud como la que devuelve GET /solicitud-de-servicio al profesional
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

describe('ordenar las solicitudes del profesional', () => {
  it('en Nuevas pone primero las urgentes y después las más viejas', () => {
    const vieja = solicitud({ idSolicitud: 1, fechaCambioEstado: '2026-11-01T08:00:00' })
    const nueva = solicitud({ idSolicitud: 2, fechaCambioEstado: '2026-11-01T12:00:00' })
    const urgente = solicitud({ idSolicitud: 3, urgente: true, fechaCambioEstado: '2026-11-01T13:00:00' })

    const orden = ordenar('nuevas', [nueva, urgente, vieja]).map((s) => s.idSolicitud)

    expect(orden).toEqual([3, 1, 2])
  })

  it('en En curso arma una carpeta de urgentes arriba y después una por estado', () => {
    const lista = ordenar('en_curso', [
      solicitud({ idSolicitud: 1, estadoServicio: 'presupuestado' }),
      solicitud({ idSolicitud: 2, estadoServicio: 'agendado', urgente: true }),
      solicitud({ idSolicitud: 3, estadoServicio: 'reprogramacion' }),
    ])

    const carpetas = enCarpetas('en_curso', lista).map((c) => c.clave)

    expect(carpetas).toEqual([URGENTES, 'reprogramacion', 'presupuestado'])
  })

  it('separa cada solicitud en la pestaña que le corresponde a su estado', () => {
    const todas = [
      solicitud({ idSolicitud: 1, estadoServicio: 'solicitado' }),
      solicitud({ idSolicitud: 2, estadoServicio: 'contratado' }),
      solicitud({ idSolicitud: 3, estadoServicio: 'finalizado' }),
    ]

    expect(delGrupo(todas, 'nuevas').map((s) => s.idSolicitud)).toEqual([1])
    expect(delGrupo(todas, 'en_curso').map((s) => s.idSolicitud)).toEqual([2])
    expect(delGrupo(todas, 'historial').map((s) => s.idSolicitud)).toEqual([3])
  })
})

describe('acciones del detalle', () => {
  it('una solicitud nueva se puede rechazar o aceptar', () => {
    expect(accionesDelDetalle(solicitud({ estadoServicio: 'solicitado' }))).toEqual(
      expect.arrayContaining(['rechazar', 'aceptar']),
    )
  })

  it('no deja presupuestar antes de la visita, sí después', () => {
    const antes = solicitud({ estadoServicio: 'agendado', fechaVisita: '2999-01-01T10:00:00' })
    const despues = solicitud({ estadoServicio: 'agendado', fechaVisita: '2020-01-01T10:00:00' })

    expect(accionesDelDetalle(antes)).not.toContain('presupuestar')
    expect(accionesDelDetalle(despues)).toContain('presupuestar')
  })

  it('una solicitud terminada no tiene acciones', () => {
    expect(accionesDelDetalle(solicitud({ estadoServicio: 'finalizado' }))).toEqual([])
  })
})