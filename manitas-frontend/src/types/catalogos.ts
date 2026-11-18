// Catálogos: ubicación (provincia, localidad, zona) y oficios (especialidad, tipos de servicio)

// Catálogos de ubicación: GET /provincia, /localidad?provincia=, /zona?localidad=
export interface Provincia {
  idProvincia: number
  nombreProvincia: string
}

export interface Localidad {
  idLocalidad: number
  codigoPostal: string | null
  nombreLocalidad: string
}

export interface Zona {
  idZona: number
  nombreZona: string
}

// Catálogos de oficios: GET /especialidad, /tipos-de-servicio
export interface Especialidad {
  idEspecialidad: number
  nombreEspecialidad: string
  descripcionEspecialidad: string
  // Separadas por coma (ej: "caño, canilla, pérdida"); las usa el buscador del cliente
  palabrasClave?: string | null
}

// En el registro de profesional se muestran como "Habilidades"
export interface TipoDeServicio {
  idServicio: number
  nombreServicio: string
  descripcionServicio: string
  especialidad: Especialidad
}
