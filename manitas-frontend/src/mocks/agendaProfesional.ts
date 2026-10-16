// DATOS MOCK del profesional, solo para la sesión demo (ver AccesosDemo).
// Las fechas se arman a partir de hoy para que siempre haya algo que ver.
// Con sesión real se usan GET /solicitud-de-servicio, /agenda y /urgentes.
import type { ClienteDeSolicitud, EventoAgenda, SolicitudResumen, UrgenteDisponible } from '../types'

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

const centro = { nombreZona: 'Centro' }
const sur = { nombreZona: 'Zona Sur' }
const sofia: ClienteDeSolicitud = { nombre: 'Sofía', apellido: 'Pérez', telefono: '3411112222', calle: 'Córdoba', altura: 1234, piso: '3', depto: 'B', zonaResidencia: centro }
const ana: ClienteDeSolicitud = { nombre: 'Ana', apellido: 'López', telefono: '3413334444', calle: 'San Martín', altura: 560, zonaResidencia: sur }
const carlos: ClienteDeSolicitud = { nombre: 'Carlos', apellido: 'Díaz', telefono: '3415556666', calle: 'Mitre', altura: 845, zonaResidencia: centro }
const laura: ClienteDeSolicitud = { nombre: 'Laura', apellido: 'Méndez', telefono: '3417778888', calle: 'Oroño', altura: 1450, zonaResidencia: centro }
const juan: ClienteDeSolicitud = { nombre: 'Juan', apellido: 'Pérez', telefono: '3419990000', calle: 'Pellegrini', altura: 2200, zonaResidencia: sur }

const plomeria = { nombreEspecialidad: 'Plomería' }
const gas = { nombreEspecialidad: 'Gas' }

function solicitud(datos: Partial<SolicitudResumen> & Pick<SolicitudResumen, 'idSolicitud' | 'estadoServicio'>): SolicitudResumen {
  return {
    urgente: false,
    descripcionProblema: '',
    fechaSolicitud: haceHoras(26),
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
  solicitud({ idSolicitud: 102, estadoServicio: 'agendado', descripcionProblema: 'Pierde agua la canilla de la cocina.', cliente: sofia, fechaVisita: dia(0, 9).toISOString(), fechaFinEstimada: dia(0, 10).toISOString(), costoVisita: 5000 }),
  solicitud({ idSolicitud: 103, estadoServicio: 'agendado', descripcionProblema: 'Instalación de termotanque.', cliente: ana, costoEstimado: 40000, costoFinal: 40000, fechaVisita: dia(-3, 10).toISOString(), fechaInicio: dia(0, 15).toISOString(), fechaFinEstimada: dia(0, 17, 30).toISOString() }),
  solicitud({ idSolicitud: 105, estadoServicio: 'agendado', descripcionProblema: 'Revisión de la instalación de gas.', cliente: carlos, especialidad: gas, costoEstimado: 35000, costoFinal: 35000, fechaVisita: dia(-1, 11).toISOString(), fechaInicio: dia(3, 9).toISOString(), fechaFinEstimada: dia(3, 13).toISOString() }),
  // Esperando que el cliente acepte el presupuesto
  solicitud({ idSolicitud: 106, estadoServicio: 'presupuestado', descripcionProblema: 'Cambiar el flotante del tanque.', cliente: laura, costoFinal: 18000, fechaVisita: dia(-1, 16).toISOString() }),
  // Historial
  solicitud({ idSolicitud: 101, estadoServicio: 'finalizado', descripcionProblema: 'Cambio de cañería del baño.', cliente: carlos, costoEstimado: 60000, costoFinal: 60000, fechaVisita: dia(-5, 10).toISOString(), fechaInicio: dia(-2, 9).toISOString(), fechaFinReal: dia(-2, 12).toISOString() }),
  solicitud({ idSolicitud: 107, estadoServicio: 'finalizado', descripcionProblema: 'Destapación de cloaca.', cliente: juan, costoEstimado: 22000, costoFinal: 22000, fechaVisita: dia(-1, 17).toISOString(), fechaInicio: dia(-1, 17).toISOString(), fechaFinReal: dia(-1, 18).toISOString() }),
  solicitud({ idSolicitud: 108, estadoServicio: 'cancelado', descripcionProblema: 'Colocación de cerámicos en el baño.', cliente: juan, fechaCambioEstado: haceHoras(72) }),
  solicitud({ idSolicitud: 109, estadoServicio: 'rechazado', descripcionProblema: 'Arreglar el portón eléctrico.', cliente: ana, fechaCambioEstado: haceHoras(120) }),
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

  const esVisita = s.costoEstimado == null
  cambiarEstadoDemo(idSolicitud, {
    estadoServicio: 'agendado',
    [esVisita ? 'fechaVisita' : 'fechaInicio']: inicio.toISOString(),
    fechaFinEstimada: fin.toISOString(),
  })
  eventosDemo = [
    ...eventosDemo,
    {
      idSolicitud,
      tipo: esVisita ? 'visita' : 'trabajo',
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

// Simula PATCH /:id/aceptar: una solicitud nueva, o una urgente (el primero que acepta se la queda).
// La urgente pasa directo a agendada, con la visita a la hora de llegada
export function aceptarDemo(idSolicitud: number, minutosLlegada?: number): void {
  const nueva = solicitudesDemo.find((s) => s.idSolicitud === idSolicitud && s.estadoServicio === 'solicitado')
  if (nueva && !nueva.urgente) {
    cambiarEstadoDemo(idSolicitud, { estadoServicio: 'en_coordinacion' })
    return
  }
  const urgente = urgentesDemo.find((u) => u.idSolicitud === idSolicitud)
  if (!urgente) throw new Error('Otro profesional ya tomó esta urgente')
  if (!minutosLlegada) throw new Error('En una urgente tenés que indicar en cuántos minutos llegás')
  urgentesDemo = urgentesDemo.filter((u) => u.idSolicitud !== idSolicitud)

  const llegada = masMinutos(new Date(), minutosLlegada)
  const fin = masMinutos(llegada, 60)
  const cliente: ClienteDeSolicitud = { nombre: urgente.cliente, apellido: '', telefono: '3410000000', calle: 'Entre Ríos', altura: 900, zonaResidencia: { nombreZona: urgente.zona } }
  solicitudesDemo = [
    ...solicitudesDemo,
    solicitud({
      idSolicitud,
      estadoServicio: 'agendado',
      urgente: true,
      descripcionProblema: urgente.descripcionProblema,
      especialidad: { nombreEspecialidad: urgente.especialidad },
      cliente,
      fechaCambioEstado: new Date().toISOString(),
      fechaVisita: llegada.toISOString(),
      fechaFinEstimada: fin.toISOString(),
    }),
  ]
  eventosDemo = [
    ...eventosDemo,
    {
      idSolicitud,
      tipo: 'visita',
      inicio: llegada,
      fin,
      estado: 'agendado',
      urgente: true,
      especialidad: urgente.especialidad,
      descripcionProblema: urgente.descripcionProblema,
      con: cliente,
      direccion: 'Entre Ríos 900',
      zona: urgente.zona,
    },
  ]
}

// Simula PATCH /:id/rechazar
export function rechazarDemo(idSolicitud: number): void {
  cambiarEstadoDemo(idSolicitud, { estadoServicio: 'rechazado' })
}

// Simula PATCH /:id/presupuestar (después de la visita)
export function presupuestarDemo(idSolicitud: number, costo: number): void {
  cambiarEstadoDemo(idSolicitud, { estadoServicio: 'presupuestado', costoFinal: costo })
}

function cambiarEstadoDemo(idSolicitud: number, cambios: Partial<SolicitudResumen>): void {
  solicitudesDemo = solicitudesDemo.map((s) =>
    s.idSolicitud === idSolicitud ? { ...s, ...cambios, fechaCambioEstado: new Date().toISOString() } : s,
  )
}