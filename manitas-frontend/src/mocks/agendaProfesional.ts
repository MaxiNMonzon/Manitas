// DATOS MOCK de la agenda del profesional, solo para la sesión demo (ver AccesosDemo).
// Las fechas se arman a partir de hoy para que siempre haya algo que ver.
// Con sesión real se usa GET /solicitud-de-servicio/agenda y GET /solicitud-de-servicio.
import type { EventoAgenda, SolicitudResumen } from '../types'

function dia(desdeHoy: number, hora: number, minutos = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + desdeHoy)
  d.setHours(hora, minutos, 0, 0)
  return d
}

function masMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60 * 1000)
}

const sofia = { nombre: 'Sofía', apellido: 'Pérez', telefono: '3411112222' }
const ana = { nombre: 'Ana', apellido: 'López', telefono: '3413334444' }
const carlos = { nombre: 'Carlos', apellido: 'Díaz', telefono: '3415556666' }
const laura = { nombre: 'Laura', apellido: 'Méndez', telefono: '3417778888' }

// Se exporta como `let` para que la sesión demo pueda "agendar" y ver el cambio
export let eventosDemo: EventoAgenda[] = [
  {
    idSolicitud: 101,
    tipo: 'trabajo',
    inicio: dia(-2, 9),
    fin: dia(-2, 12),
    estado: 'finalizado',
    urgente: false,
    especialidad: 'Plomería',
    descripcionProblema: 'Cambio de cañería del baño.',
    con: carlos,
    direccion: 'Mitre 845',
    zona: 'Centro',
  },
  {
    idSolicitud: 102,
    tipo: 'visita',
    inicio: dia(0, 9),
    fin: dia(0, 10),
    estado: 'agendado',
    urgente: false,
    especialidad: 'Plomería',
    descripcionProblema: 'Pierde agua la canilla de la cocina.',
    con: sofia,
    direccion: 'Córdoba 1234, piso 3, depto B',
    zona: 'Centro',
  },
  {
    idSolicitud: 103,
    tipo: 'trabajo',
    inicio: dia(0, 15),
    fin: dia(0, 17, 30),
    estado: 'agendado',
    urgente: false,
    especialidad: 'Plomería',
    descripcionProblema: 'Instalación de termotanque.',
    con: ana,
    direccion: 'San Martín 560',
    zona: 'Zona Sur',
  },
  {
    idSolicitud: 104,
    tipo: 'visita',
    inicio: dia(1, 10),
    fin: dia(1, 11),
    estado: 'agendado',
    urgente: true,
    especialidad: 'Plomería',
    descripcionProblema: 'Se rompió un caño, sale mucha agua.',
    con: laura,
    direccion: 'Oroño 1450',
    zona: 'Centro',
  },
  {
    idSolicitud: 105,
    tipo: 'trabajo',
    inicio: dia(3, 9),
    fin: dia(3, 13),
    estado: 'agendado',
    urgente: false,
    especialidad: 'Gas',
    descripcionProblema: 'Revisión de la instalación de gas y prueba de hermeticidad.',
    con: carlos,
    direccion: 'Mitre 845',
    zona: 'Centro',
  },
]

export let pendientesDemo: SolicitudResumen[] = [
  {
    idSolicitud: 201,
    estadoServicio: 'en_coordinacion',
    urgente: false,
    descripcionProblema: 'Destapar la pileta del lavadero.',
    fechaCambioEstado: masMinutos(new Date(), -5 * 60).toISOString(),
    costoEstimado: null,
    especialidad: { nombreEspecialidad: 'Plomería' },
    cliente: laura,
  },
  {
    idSolicitud: 202,
    estadoServicio: 'en_coordinacion',
    urgente: false,
    descripcionProblema: 'Arreglar el calefón (presupuesto ya aceptado).',
    fechaCambioEstado: masMinutos(new Date(), -40 * 60).toISOString(),
    costoEstimado: 35000,
    especialidad: { nombreEspecialidad: 'Gas' },
    cliente: sofia,
  },
]

// Simula PATCH /:id/agendar en la sesión demo (con el mismo control de superposición que el back)
export function agendarDemo(idSolicitud: number, inicio: Date, duracionMinutos: number): void {
  const fin = masMinutos(inicio, duracionMinutos)
  const pisada = eventosDemo.find((e) => e.estado === 'agendado' && inicio < e.fin && e.inicio < fin)
  if (pisada) {
    throw new Error(`Se pisa con ${pisada.tipo === 'visita' ? 'la visita' : 'el trabajo'} de ${pisada.con?.nombre}`)
  }
  const pendiente = pendientesDemo.find((p) => p.idSolicitud === idSolicitud)
  if (!pendiente) throw new Error('Solicitud no encontrada')

  pendientesDemo = pendientesDemo.filter((p) => p.idSolicitud !== idSolicitud)
  eventosDemo = [
    ...eventosDemo,
    {
      idSolicitud,
      tipo: pendiente.costoEstimado == null ? 'visita' : 'trabajo',
      inicio,
      fin,
      estado: 'agendado',
      urgente: pendiente.urgente,
      especialidad: pendiente.especialidad?.nombreEspecialidad ?? null,
      descripcionProblema: pendiente.descripcionProblema,
      con: pendiente.cliente ?? null,
      direccion: 'Dirección de prueba 123',
      zona: 'Centro',
    },
  ]
}
