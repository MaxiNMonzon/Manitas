// DATOS MOCK para la pantalla de inicio del cliente, mientras no haya datos cargados en el back.
// Cuando existan, reemplazar por:
//   categorias      → GET /especialidad
//   profesionales   → GET /profesional?zona=<zona del cliente> (+ GET /profesional/:id/calificaciones)
//   promociones     → GET /promocion/del-mes
//   notificaciones  → (todavía no hay endpoint; CUU "Notificar próximas visitas")

export interface Categoria {
  idEspecialidad: number
  nombre: string
}

export interface ProfesionalResumen {
  idUsuario: number
  nombre: string
  apellido: string
  fotoUrl: string | null
  especialidades: string[]
  zona: string
  calificacion: number // promedio de 0 a 5
  cantidadCalificaciones: number
  descripcion: string
}

export interface PromoBancaria {
  idPromocion: number
  banco: string
  titulo: string
  detalle: string
  color: string // color de la marca del banco, para el ícono
}

export interface Notificacion {
  id: number
  texto: string
  cuando: string
  leida: boolean
}

export const categorias: Categoria[] = [
  { idEspecialidad: 1, nombre: 'Electricidad' },
  { idEspecialidad: 2, nombre: 'Plomería' },
  { idEspecialidad: 3, nombre: 'Gas' },
  { idEspecialidad: 4, nombre: 'Pintura' },
  { idEspecialidad: 5, nombre: 'Albañilería' },
  { idEspecialidad: 6, nombre: 'Carpintería' },
  { idEspecialidad: 7, nombre: 'Cerrajería' },
  { idEspecialidad: 8, nombre: 'Climatización' },
  { idEspecialidad: 9, nombre: 'Limpieza' },
  { idEspecialidad: 10, nombre: 'Jardinería' },
]

export const profesionalesCercanos: ProfesionalResumen[] = [
  {
    idUsuario: 1,
    nombre: 'Oscar',
    apellido: 'Gómez',
    fotoUrl: null,
    especialidades: ['Electricidad'],
    zona: 'Zona Sur',
    calificacion: 2.5,
    cantidadCalificaciones: 14,
    descripcion: 'Electricista matriculado. Instalaciones, tableros y reparaciones en general.',
  },
  {
    idUsuario: 2,
    nombre: 'Elvio',
    apellido: 'Solís',
    fotoUrl: null,
    especialidades: ['Plomería'],
    zona: 'Zona Oeste',
    calificacion: 5,
    cantidadCalificaciones: 31,
    descripcion: 'Plomero con 15 años de experiencia. Destapaciones, pérdidas y termotanques.',
  },
  {
    idUsuario: 3,
    nombre: 'Marta',
    apellido: 'Ríos',
    fotoUrl: null,
    especialidades: ['Pintura', 'Albañilería'],
    zona: 'Centro',
    calificacion: 4.5,
    cantidadCalificaciones: 22,
    descripcion: 'Pintura de interiores y exteriores, reparación de paredes y humedad.',
  },
  {
    idUsuario: 4,
    nombre: 'Julián',
    apellido: 'Pereyra',
    fotoUrl: null,
    especialidades: ['Gas'],
    zona: 'Zona Norte',
    calificacion: 4,
    cantidadCalificaciones: 9,
    descripcion: 'Gasista matriculado. Instalación y revisión de artefactos, pruebas de hermeticidad.',
  },
  {
    idUsuario: 5,
    nombre: 'Lucía',
    apellido: 'Fernández',
    fotoUrl: null,
    especialidades: ['Carpintería'],
    zona: 'Zona Sur',
    calificacion: 4.5,
    cantidadCalificaciones: 17,
    descripcion: 'Muebles a medida, placares y arreglos de aberturas.',
  },
]

export const promocionesDelMes: PromoBancaria[] = [
  {
    idPromocion: 1,
    banco: 'Banco Nación',
    titulo: '20% OFF',
    detalle: 'Pagando con BNA+',
    color: '#0072bb',
  },
  {
    idPromocion: 2,
    banco: 'Banco Galicia',
    titulo: '3 cuotas sin interés',
    detalle: 'Con tarjetas de crédito Galicia',
    color: '#f58220',
  },
  {
    idPromocion: 3,
    banco: 'Banco Macro',
    titulo: '15% de reintegro',
    detalle: 'Con tarjeta de débito Macro',
    color: '#1c3f94',
  },
]

export const notificaciones: Notificacion[] = [
  { id: 1, texto: 'Mañana a las 10:00 tenés la visita de Elvio Solís (Plomería).', cuando: 'Hace 1 hora', leida: false },
  { id: 2, texto: 'Oscar Gómez te envió un presupuesto.', cuando: 'Ayer', leida: false },
  { id: 3, texto: 'Nueva promo: 20% OFF con Banco Nación.', cuando: 'Hace 3 días', leida: true },
]
