// DATOS MOCK del profesional, solo para la sesión demo (ver AccesosDemo).
// Las fechas se arman a partir de hoy para que siempre haya algo que ver.
// Con sesión real se usan GET /solicitud-de-servicio, /agenda y /urgentes.
import type { EventoAgenda, SolicitudResumen, UrgenteDisponible } from '../types'

function dia(desdeHoy: number, hora: number, minutos = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + desdeHoy)
  d.setHours(hora, minutos, 0, 0)
  return d
}

function masMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60 * 1000)
}

const haceHoras = (horas: number) => masMinutos(new Date(), -horas * 60).toISOString()

const sofia = { nombre: 'Sofía', apellido: 'Pérez', telefono: '3411112222' }
const ana = { nombre: 'Ana', apellido: 'López', telefono: '3413334444' }
const carlos = { nombre: 'Carlos', apellido: 'Díaz', telefono: '3415556666' }
const laura = { nombre: 'Laura', apellido: 'Méndez', telefono: '3417778888' }
const juan = { nombre: 'Juan', apellido: 'Pérez', telefono: '3419990000' }

const plomeria = { nombreEspecialidad: 'Plomería' }
const gas = { nombreEspecialidad: 'Gas' }

function solicitud(datos: Partial<SolicitudResumen> & Pick<SolicitudResumen, 'idSolicitud' | 'estadoServicio'>): SolicitudResumen {
  return {
    urgente: false,
    descripcionProblema: '',
    fechaCambioEstado: haceHoras(2),
    costoEstimado: null,
    costoFinal: null,
    fechaFinReal: null,
    especialidad: plomeria,
    ...datos,
  }
}

// Se exportan como `let` para que la sesión demo pueda agendar/aceptar y ver el cambio
export let solicitudesDemo: SolicitudResumen[] = [
  // Para aceptar o rechazar
  solicitud({ idSolicitud: 301, estadoServicio: 'solicitado', descripcionProblema: 'Reparación de cañería', cliente: juan }),
  solicitud({ idSolicitud: 302, estadoServicio: 'solicitado', descripcionProblema: 'Instalar una canilla nueva', cliente: ana, fechaCambioEstado: haceHoras(30) }),
  // Pendientes de fecha
  solicitud({ idSolicitud: 201, estadoServicio: 'en_coordinacion', descripcionProblema: 'Destapar la pileta del lavadero.', cliente: laura, fechaCambioEstado: haceHoras(5) }),
  solicitud({ idSolicitud: 202, estadoServicio: 'en_coordinacion', descripcionProblema: 'Arreglar el calefón (presupuesto ya aceptado).', cliente: sofia, especialidad: gas, costoEstimado: 35000, costoFinal: 35000, fechaCambioEstado: haceHoras(40) }),
  // Agendadas (las de la agenda)
  solicitud({ idSolicitud: 102, estadoServicio: 'agendado', descripcionProblema: 'Pierde agua la canilla de la cocina.', cliente: sofia }),
  solicitud({ idSolicitud: 103, estadoServicio: 'agendado', descripcionProblema: 'Instalación de termotanque.', cliente: ana, costoEstimado: 40000, costoFinal: 40000 }),
  solicitud({ idSolicitud: 105, estadoServicio: 'agendado', descripcionProblema: 'Revisión de la instalación de gas.', cliente: carlos, especialidad: gas, costoEstimado: 35000, costoFinal: 35000 }),
  // Esperando que el cliente acepte el presupuesto
  solicitud({ idSolicitud: 106, estadoServicio: 'presupuestado', descripcionProblema: 'Cambiar el flotante del tanque.', cliente: laura, costoFinal: 18000 }),
  // Terminadas y cobradas este mes
  solicitud({ idSolicitud: 101, estadoServicio: 'finalizado', descripcionProblema: 'Cambio de cañería del baño.', cliente: carlos, costoEstimado: 60000, costoFinal: 60000, fechaFinReal: dia(-2, 12).toISOString() }),
  solicitud({ idSolicitud: 107, estadoServicio: 'finalizado', descripcionProblema: 'Destapación de cloaca.', cliente: juan, costoEstimado: 22000, costoFinal: 22000, fechaFinReal: dia(-1, 18).toISOString() }),
]

export let urgentesDemo: UrgenteDisponible[] = [
  {
    idSolicitud: 401,
    especialidad: 'Plomería',
    descripcionProblema: 'Se rompió un caño debajo de la pileta y sale mucha agua.',
    zona: 'Centro',
    cliente: 'Martina',
    minutosQueQuedan: 42,
  },
]

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

// Simula PATCH /:id/agendar (con el mismo control de superposición que el back)
export function agendarDemo(idSolicitud: number, inicio: Date, duracionMinutos: number): void {
  const fin = masMinutos(inicio, duracionMinutos)
  const pisada = eventosDemo.find((e) => e.estado === 'agendado' && inicio < e.fin && e.inicio < fin)
  if (pisada) {
    throw new Error(`Se pisa con ${pisada.tipo === 'visita' ? 'la visita' : 'el trabajo'} de ${pisada.con?.nombre}`)
  }
  const s = solicitudesDemo.find((x) => x.idSolicitud === idSolicitud)
  if (!s) throw new Error('Solicitud no encontrada')

  solicitudesDemo = solicitudesDemo.map((x) => (x.idSolicitud === idSolicitud ? { ...x, estadoServicio: 'agendado' } : x))
  eventosDemo = [
    ...eventosDemo,
    {
      idSolicitud,
      tipo: s.costoEstimado == null ? 'visita' : 'trabajo',
      inicio,
      fin,
      estado: 'agendado',
      urgente: s.urgente,
      especialidad: s.especialidad?.nombreEspecialidad ?? null,
      descripcionProblema: s.descripcionProblema,
      con: s.cliente ?? null,
      direccion: 'Dirección de prueba 123',
      zona: 'Centro',
    },
  ]
}

// Simula PATCH /:id/aceptar de una urgente: pasa a "en coordinación" (pendiente de fecha)
export function aceptarUrgenteDemo(idSolicitud: number): void {
  const urgente = urgentesDemo.find((u) => u.idSolicitud === idSolicitud)
  if (!urgente) throw new Error('Otro profesional ya tomó esta urgente')
  urgentesDemo = urgentesDemo.filter((u) => u.idSolicitud !== idSolicitud)
  solicitudesDemo = [
    ...solicitudesDemo,
    solicitud({
      idSolicitud,
      estadoServicio: 'en_coordinacion',
      urgente: true,
      descripcionProblema: urgente.descripcionProblema,
      especialidad: { nombreEspecialidad: urgente.especialidad },
      cliente: { nombre: urgente.cliente, apellido: '', telefono: '3410000000' },
      fechaCambioEstado: new Date().toISOString(),
    }),
  ]
}
