// Profesionales: búsqueda, calificaciones y cómo se muestran al cliente

// GET /profesional?especialidad=&zona= (solo los campos que usa el front)
export interface ProfesionalApi {
  idUsuario: number
  nombre: string
  apellido: string
  costoVisita?: number | null
  descripcion?: string | null
  especialidades: { idEspecialidad: number; nombreEspecialidad: string }[]
  zonasDeCobertura: { idZona: number; nombreZona: string }[]
  // Sus habilidades (tipos de servicio)
  tiposDeServicio?: { idServicio: number; nombreServicio: string }[]
  // Su promedio de estrellas (lo calcula el back en el mismo pedido)
  calificacion?: Calificaciones
}

// GET /profesional/:id/calificaciones (con las reseñas)
export interface CalificacionesDetalle extends Calificaciones {
  reseñas: { calificacion: number; reseña: string | null; fecha: string | null; cliente: string }[]
}

// GET /profesional/:id/calificaciones (solo lo que usa el front)
export interface Calificaciones {
  promedio: number | null // 1 decimal; null si todavía no tiene
  cantidad: number
}

// Un oficio como lo muestra el buscador del cliente (GET /especialidad)
export interface Categoria {
  idEspecialidad: number
  nombre: string
  // Las palabras con las que el cliente cuenta su problema (ej: "caño" → Plomería)
  palabrasClave?: string[]
}

// Un profesional en el buscador y en el inicio del cliente (GET /profesional)
export interface ProfesionalResumen {
  idUsuario: number
  nombre: string
  apellido: string
  fotoUrl: string | null
  especialidades: string[]
  // Las mismas, con su id (para pedir presupuesto de una de ellas)
  oficios: { idEspecialidad: number; nombre: string }[]
  zona: string
  calificacion: number // promedio de 0 a 5
  cantidadCalificaciones: number
  descripcion: string
  costoVisita: number | null
  // Sus habilidades (ej: "Destapaciones"), para el buscador
  habilidades?: string[]
}