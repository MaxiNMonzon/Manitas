// Une los datos mock del cliente y del profesional de la sesión demo, para que lo que hace uno
// le llegue al otro (como en el back): lo que pide el cliente demo le llega al profesional demo,
// y lo que responde el profesional (aceptar, presupuestar...) lo ve el cliente.
// Cada archivo de mocks registra acá cómo se actualiza su lista (así no se importan entre ellos).
import type { SolicitudResumen, UrgenteDisponible } from '../types'

type Cambios = Partial<SolicitudResumen>

export const espejoDemo = {
  // Un cambio de estado/fechas/montos hecho del otro lado
  alCliente: (_id: number, _cambios: Cambios) => {},
  alProfesional: (_id: number, _cambios: Cambios) => {},
  // Lo nuevo que pide el cliente
  nuevaParaProfesional: (_s: SolicitudResumen) => {},
  nuevaUrgente: (_u: UrgenteDisponible) => {},
  // Si la canceló el cliente antes de que alguien la tome
  quitarUrgente: (_id: number) => {},
}

// Horarios propuestos en las reprogramaciones (los ven los dos lados)
export const propuestasDemo = new Map<number, Date>()

// En la demo, el profesional que responde es siempre el del perfil de prueba
export const profesionalDemo = { idUsuario: 7, nombre: 'Esteban', apellido: 'Quito', telefono: '3415673202' }
// Y el cliente que pide, siempre el del perfil de prueba del cliente
export const clienteDemo = {
  nombre: 'Laura',
  apellido: 'Méndez',
  telefono: '3415551001',
  calle: 'Zeballos',
  altura: 1451,
  piso: '3',
  depto: 'B',
  zonaResidencia: { nombreZona: 'Centro' },
}

// Lo que se copia de un lado al otro (nunca la otra persona: cada lado ve a la suya)
export function sinPersonas(cambios: Cambios): Cambios {
  const { cliente: _c, profesional: _p, ...resto } = cambios
  return resto
}
