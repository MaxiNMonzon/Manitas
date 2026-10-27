// DATOS MOCK de las solicitudes del cliente, solo para la sesión demo (ver AccesosDemo).
// Las fechas se arman a partir de hoy para que siempre haya algo que ver.
// Con sesión real se usa GET /solicitud-de-servicio (el back devuelve las del cliente logueado).
// Lo nuevo que pide el cliente le llega al profesional demo, y sus respuestas vuelven acá (ver espejoDemo)
import type { ProfesionalDeSolicitud, SolicitudResumen, TurnoLibre } from '../types'
import { clienteDemo, espejoDemo, propuestasDemo, sinPersonas } from './espejoDemo'

function dia(desdeHoy: number, hora: number, minutos = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + desdeHoy)
  d.setHours(hora, minutos, 0, 0)
  return d
}

const haceHoras = (horas: number) => new Date(Date.now() - horas * 60 * 60 * 1000).toISOString()

const jorge: ProfesionalDeSolicitud = { idUsuario: 11, nombre: 'Jorge', apellido: 'Díaz', telefono: '3414445555' }
const elvio: ProfesionalDeSolicitud = { idUsuario: 2, nombre: 'Elvio', apellido: 'Solís', telefono: '3416667777' }
const marta: ProfesionalDeSolicitud = { idUsuario: 3, nombre: 'Marta', apellido: 'Ríos', telefono: '3418889999' }
const oscar: ProfesionalDeSolicitud = { idUsuario: 1, nombre: 'Oscar', apellido: 'Gómez', telefono: '3412223333' }

const plomeria = { nombreEspecialidad: 'Plomería' }
const electricidad = { nombreEspecialidad: 'Electricidad' }
const pintura = { nombreEspecialidad: 'Pintura' }

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

// Se exporta como `let` para que la sesión demo pueda aceptar/cancelar y ver el cambio
export let solicitudesClienteDemo: SolicitudResumen[] = [
  // En curso
  solicitud({ idSolicitud: 501, estadoServicio: 'solicitado', descripcionProblema: 'Reparación de cañería', profesional: jorge, fechaVisita: dia(2, 16).toISOString(), costoVisita: 5000 }),
  solicitud({ idSolicitud: 502, estadoServicio: 'agendado', descripcionProblema: 'Pierde agua el inodoro.', profesional: elvio, fechaVisita: dia(1, 10).toISOString(), costoVisita: 4000 }),
  solicitud({ idSolicitud: 503, estadoServicio: 'presupuestado', descripcionProblema: 'Pintar el living y el pasillo.', profesional: marta, especialidad: pintura, fechaVisita: dia(-1, 11).toISOString(), costoVisita: 6000, costoFinal: 180000, horasTrabajo: 8 }),
  solicitud({ idSolicitud: 504, estadoServicio: 'contratado', descripcionProblema: 'Cambiar los tomas de la cocina.', profesional: oscar, especialidad: electricidad, fechaVisita: dia(-2, 9).toISOString(), fechaInicio: dia(-1, 9).toISOString(), fechaFinEstimada: dia(-1, 13).toISOString(), costoEstimado: 45000, costoFinal: 45000, fechaAceptacion: haceHoras(30) }),
  solicitud({ idSolicitud: 505, estadoServicio: 'reprogramacion', estadoAnterior: 'agendado', propuestaDe: 'profesional', descripcionProblema: 'Revisar la presión del agua.', profesional: elvio, fechaVisita: dia(3, 15).toISOString() }),
  // Completadas
  solicitud({ idSolicitud: 461, estadoServicio: 'finalizado', descripcionProblema: 'Destapación de cloaca.', profesional: jorge, fechaVisita: dia(-10, 17).toISOString(), fechaInicio: dia(-10, 17).toISOString(), fechaFinReal: dia(-10, 18).toISOString(), costoEstimado: 22000, costoFinal: 22000, fechaPago: dia(-10, 18).toISOString() }),
  solicitud({ idSolicitud: 462, estadoServicio: 'finalizado', descripcionProblema: 'Instalar ventilador de techo.', profesional: oscar, especialidad: electricidad, fechaVisita: dia(-20, 10).toISOString(), fechaInicio: dia(-18, 9).toISOString(), fechaFinReal: dia(-18, 11).toISOString(), costoEstimado: 30000, costoFinal: 30000, fechaPago: dia(-18, 11).toISOString(), calificacionServicio: 5, reseñaServicio: 'Muy prolijo y puntual.' }),
  // Rechazó el presupuesto: queda por pagar la visita
  solicitud({ idSolicitud: 464, estadoServicio: 'rechazado', descripcionProblema: 'Cambiar el termotanque.', profesional: elvio, fechaVisita: dia(-3, 10).toISOString(), costoVisita: 4000, costoFinal: 4000, fechaCambioEstado: haceHoras(48) }),
  solicitud({ idSolicitud: 463, estadoServicio: 'cancelado', descripcionProblema: 'Cambiar la canilla del lavadero.', profesional: elvio, fechaCambioEstado: haceHoras(24 * 7) }),
]
propuestasDemo.set(505, dia(5, 15))

// Cambia una solicitud de este lado (sin avisar al otro)
function aplicar(idSolicitud: number, cambios: Partial<SolicitudResumen>) {
  solicitudesClienteDemo = solicitudesClienteDemo.map((s) =>
    s.idSolicitud === idSolicitud ? { ...s, ...cambios, fechaCambioEstado: new Date().toISOString() } : s,
  )
}

// Lo que hace el cliente también lo ve el profesional
function cambiar(idSolicitud: number, cambios: Partial<SolicitudResumen>) {
  aplicar(idSolicitud, cambios)
  espejoDemo.alProfesional(idSolicitud, sinPersonas(cambios))
}

// Lo que responde el profesional (aceptar, presupuestar...) se ve de este lado
espejoDemo.alCliente = (idSolicitud, cambios) => {
  aplicar(idSolicitud, cambios)
  // Si la tomó como urgente, ahora ya tiene profesional
  if (cambios.profesional) aplicar(idSolicitud, { profesional: cambios.profesional })
}

const buscar = (idSolicitud: number) => solicitudesClienteDemo.find((s) => s.idSolicitud === idSolicitud)

export function aceptarPresupuestoDemo(idSolicitud: number, inicioTrabajo: Date | null): void {
  const s = buscar(idSolicitud)
  // Sin inicio: en el momento, o el mismo horario si era un cambio de precio a mitad del trabajo
  const inicio = inicioTrabajo ?? (s?.fechaInicio ? new Date(s.fechaInicio) : new Date())
  const fin = new Date(inicio.getTime() + (s?.horasTrabajo ?? 1) * 3600000)
  cambiar(idSolicitud, {
    estadoServicio: 'contratado',
    costoEstimado: s?.costoFinal ?? null,
    fechaInicio: inicio.toISOString(),
    fechaFinEstimada: fin.toISOString(),
    fechaAceptacion: new Date().toISOString(),
  })
}

let proximoId = 900

// Simula POST /solicitud-de-servicio: queda "solicitado" con la visita en el turno elegido.
// En la demo le llega al profesional de prueba (sea cual sea el elegido)
export function crearSolicitudDemo(datos: { profesional: ProfesionalDeSolicitud; especialidad: string; descripcionProblema: string; inicioTurno: Date; costoVisita: number | null }): void {
  const nueva = solicitud({
    idSolicitud: proximoId++,
    estadoServicio: 'solicitado',
    descripcionProblema: datos.descripcionProblema,
    profesional: datos.profesional,
    especialidad: { nombreEspecialidad: datos.especialidad },
    fechaSolicitud: new Date().toISOString(),
    fechaCambioEstado: new Date().toISOString(),
    fechaVisita: datos.inicioTurno.toISOString(),
    fechaFinEstimada: new Date(datos.inicioTurno.getTime() + 3600000).toISOString(),
    costoVisita: datos.costoVisita,
  })
  solicitudesClienteDemo = [nueva, ...solicitudesClienteDemo]
  espejoDemo.nuevaParaProfesional({ ...nueva, profesional: undefined, cliente: clienteDemo })
}

// Simula POST /solicitud-de-servicio/urgente: sin profesional hasta que alguien la toma.
// Le aparece al profesional de prueba en "Urgencias cerca tuyo"
export function crearUrgenteDemo(especialidad: string, descripcionProblema: string): void {
  const id = proximoId++
  solicitudesClienteDemo = [
    solicitud({
      idSolicitud: id,
      estadoServicio: 'solicitado',
      urgente: true,
      descripcionProblema,
      profesional: null,
      especialidad: { nombreEspecialidad: especialidad },
      fechaSolicitud: new Date().toISOString(),
      fechaCambioEstado: new Date().toISOString(),
    }),
    ...solicitudesClienteDemo,
  ]
  espejoDemo.nuevaUrgente({
    idSolicitud: id,
    especialidad,
    descripcionProblema,
    zona: clienteDemo.zonaResidencia.nombreZona,
    cliente: clienteDemo.nombre,
    minutosQueQuedan: 60,
  })
}

// Simula PATCH /:id/reprogramar del cliente: propone otro horario y le toca contestar al profesional
export function reprogramarClienteDemo(idSolicitud: number, inicio: Date): void {
  const s = buscar(idSolicitud)
  if (!s) return
  propuestasDemo.set(idSolicitud, inicio)
  cambiar(idSolicitud, {
    estadoServicio: 'reprogramacion',
    estadoAnterior: s.estadoServicio === 'reprogramacion' ? s.estadoAnterior : s.estadoServicio,
    propuestaDe: 'cliente',
  })
}

export function rechazarPresupuestoDemo(idSolicitud: number): void {
  const s = buscar(idSolicitud)
  // Si cobra la visita, queda para pagar solo eso
  cambiar(idSolicitud, { estadoServicio: 'rechazado', costoFinal: s?.costoVisita ?? null })
}

export function cancelarDemo(idSolicitud: number): void {
  cambiar(idSolicitud, { estadoServicio: 'cancelado', estadoAnterior: null, propuestaDe: null })
  espejoDemo.quitarUrgente(idSolicitud)
}

export function calificarDemo(idSolicitud: number, estrellas: number, reseña: string): void {
  cambiar(idSolicitud, { calificacionServicio: estrellas, reseñaServicio: reseña || null })
}

// Contestar el horario que propuso el profesional (como en el back: si era nueva, queda confirmada)
export function responderReprogramacionDemo(idSolicitud: number, acepta: boolean): void {
  const s = buscar(idSolicitud)
  if (!s) return
  const anterior = s.estadoAnterior ?? 'agendado'
  const nuevo = propuestasDemo.get(idSolicitud)
  const esTrabajo = anterior === 'contratado'
  cambiar(idSolicitud, {
    estadoServicio: acepta && anterior === 'solicitado' ? 'agendado' : anterior,
    estadoAnterior: null,
    propuestaDe: null,
    ...(acepta && nuevo ? (esTrabajo ? { fechaInicio: nuevo.toISOString() } : { fechaVisita: nuevo.toISOString() }) : {}),
  })
  propuestasDemo.delete(idSolicitud)
}

export const propuestaDemo = (idSolicitud: number): Date | null => propuestasDemo.get(idSolicitud) ?? null

// Turnos libres demo: de lunes a viernes, de 9 a 17
export function turnosLibresDemo(desde: string, hasta: string): TurnoLibre[] {
  const libres: TurnoLibre[] = []
  const ahora = new Date()
  const fin = new Date(`${hasta}T23:59:59`)
  for (const d = new Date(`${desde}T00:00:00`); d <= fin; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) continue
    for (let hora = 9; hora < 17; hora++) {
      const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hora)
      if (inicio > ahora) libres.push({ inicio: inicio.toISOString(), fin: new Date(inicio.getTime() + 3600000).toISOString() })
    }
  }
  return libres
}