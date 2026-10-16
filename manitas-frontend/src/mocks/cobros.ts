// DATOS MOCK de los cobros del profesional, solo para la sesión demo (ver AccesosDemo).
// Las fechas se arman a partir de hoy (últimos 6 meses) para que siempre haya algo que ver.
// Con sesión real se usa GET /solicitud-de-servicio/cobros.
import type { Cobro, MisCobros } from '../types'

const DIAS_HABILES_DEPOSITO = 3 // igual que el back

function haceDias(dias: number, hora = 12): Date {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(hora, 0, 0, 0)
  return d
}

function sumarDiasHabiles(desde: Date, dias: number): Date {
  const fecha = new Date(desde)
  let sumados = 0
  while (sumados < dias) {
    fecha.setDate(fecha.getDate() + 1)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) sumados++
  }
  return fecha
}

type Base = Omit<Cobro, 'estado' | 'fechaPago' | 'depositoEstimado' | 'fechaServicio'> & {
  pagadoHaceDias: number | null // null = el cliente todavía no pagó
  servicioHaceDias?: number
}

// Mismo cálculo que el back: depósito a los 3 días hábiles del pago
function armar(b: Base): Cobro {
  const { pagadoHaceDias, servicioHaceDias, ...resto } = b
  const fechaPago = pagadoHaceDias == null ? null : haceDias(pagadoHaceDias, 18)
  const deposito = fechaPago ? sumarDiasHabiles(fechaPago, DIAS_HABILES_DEPOSITO) : null
  const servicio = haceDias(servicioHaceDias ?? pagadoHaceDias ?? 0, 10)
  return {
    ...resto,
    estado: deposito && deposito <= new Date() ? 'cobrado' : 'pendiente_cobro',
    fechaPago: fechaPago?.toISOString() ?? null,
    depositoEstimado: deposito?.toISOString() ?? null,
    fechaServicio: servicio.toISOString(),
  }
}

const visaNacion = 'Visa crédito Banco Nación'
const masterGalicia = 'Mastercard débito Banco Galicia'
const visaMacro = 'Visa débito Banco Macro'
const mercadoPago = 'Mercado Pago prepaga'

let id = 500
const cobro = (
  cliente: [string, string],
  especialidad: string,
  descripcionProblema: string,
  monto: number,
  pagadoHaceDias: number | null,
  medioDePago: string | null,
  concepto: Cobro['concepto'] = 'trabajo',
  servicioHaceDias?: number,
): Base => ({
  idSolicitud: id++,
  concepto,
  monto,
  pagadoHaceDias,
  servicioHaceDias,
  medioDePago: pagadoHaceDias == null ? null : medioDePago,
  especialidad,
  descripcionProblema,
  cliente: { nombre: cliente[0], apellido: cliente[1] },
})

const bases: Base[] = [
  // Esperando que el cliente pague (trabajos aceptados)
  cobro(['Ana', 'López'], 'Plomería', 'Instalación de termotanque.', 40000, null, null, 'trabajo', 0),
  cobro(['Carlos', 'Díaz'], 'Gas', 'Revisión de la instalación de gas y prueba de hermeticidad.', 35000, null, null, 'trabajo', -3),
  // Recientes: algunos todavía sin depositar
  cobro(['Laura', 'Bonazzi'], 'Electricidad', 'Instalación de luces en el living.', 35000, 0, visaNacion),
  cobro(['Juan', 'Pérez'], 'Plomería', 'Colocación de canilla monocomando.', 15000, 1, masterGalicia),
  cobro(['Sofía', 'Pérez'], 'Plomería', 'Visita: pérdida en la cocina (rechazó el presupuesto).', 5000, 2, mercadoPago, 'visita'),
  cobro(['Martina', 'Ruiz'], 'Plomería', 'Urgencia: caño roto debajo de la pileta.', 28000, 4, visaMacro),
  cobro(['Carlos', 'Díaz'], 'Plomería', 'Cambio de cañería del baño.', 60000, 8, visaNacion),
  cobro(['Juan', 'Pérez'], 'Plomería', 'Destapación de cloaca.', 22000, 12, masterGalicia),
  // Meses anteriores
  cobro(['Valentina', 'Gómez'], 'Gas', 'Conexión de cocina a gas.', 30000, 33, visaNacion),
  cobro(['Pedro', 'Sosa'], 'Plomería', 'Reparación de mochila del inodoro.', 12000, 38, mercadoPago),
  cobro(['Lucía', 'Fernández'], 'Electricidad', 'Cambio de tablero eléctrico.', 85000, 45, visaMacro),
  cobro(['Diego', 'Romero'], 'Plomería', 'Visita: humedad en la pared (rechazó el presupuesto).', 5000, 50, visaNacion, 'visita'),
  cobro(['Ana', 'López'], 'Plomería', 'Instalación de lavarropas.', 18000, 63, masterGalicia),
  cobro(['Sofía', 'Pérez'], 'Gas', 'Service de calefón.', 25000, 70, visaNacion),
  cobro(['Marcos', 'Herrera'], 'Plomería', 'Cambio de flexibles y llaves de paso.', 16000, 78, mercadoPago),
  cobro(['Laura', 'Bonazzi'], 'Electricidad', 'Agregar tomacorrientes en la cocina.', 27000, 96, visaMacro),
  cobro(['Julieta', 'Navarro'], 'Plomería', 'Reparación de pérdida en el baño.', 20000, 104, visaNacion),
  cobro(['Pedro', 'Sosa'], 'Gas', 'Instalación de estufa tiro balanceado.', 55000, 118, masterGalicia),
  cobro(['Carlos', 'Díaz'], 'Plomería', 'Destapación de pileta de cocina.', 14000, 128, mercadoPago),
  cobro(['Valentina', 'Gómez'], 'Plomería', 'Visita: presupuesto de baño completo (lo rechazó).', 5000, 140, visaNacion, 'visita'),
  cobro(['Diego', 'Romero'], 'Electricidad', 'Instalación de ventilador de techo.', 24000, 150, visaMacro),
  cobro(['Marcos', 'Herrera'], 'Gas', 'Prueba de hermeticidad.', 32000, 162, visaNacion),
]

// Se arma en cada llamada para que el estado del depósito siga a la fecha de hoy
export function cobrosDemo(): MisCobros {
  const orden = (c: Cobro) => new Date(c.fechaPago ?? c.fechaServicio ?? Date.now()).getTime()
  return {
    cuentaDeposito: '4821',
    cobros: bases.map(armar).sort((a, b) => orden(b) - orden(a)),
  }
}