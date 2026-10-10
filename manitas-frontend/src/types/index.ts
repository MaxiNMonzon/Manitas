// Tipos de las respuestas del backend (manitas-backend).
// Ver la documentacion completa en http://localhost:3000/api

export type Rol = 'cliente' | 'profesional' | 'admin'

// POST /auth/login/{cliente|profesional|admin}
export interface LoginRequest {
  correo: string
  contraseña: string
}

export interface LoginResponse {
  token: string
  correo: string
}

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

// POST /auth/register/cliente
export interface RegistroClienteRequest {
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  correo: string
  contraseña: string
  telefono: string
  calle: string
  altura: number
  piso?: string // opcional, solo departamentos
  depto?: string
  idZonaResidencia: number
}

// Catálogos de oficios: GET /especialidad, /tipos-de-servicio
export interface Especialidad {
  idEspecialidad: number
  nombreEspecialidad: string
  descripcionEspecialidad: string
}

// En el registro de profesional se muestran como "Habilidades"
export interface TipoDeServicio {
  idServicio: number
  nombreServicio: string
  descripcionServicio: string
  especialidad: Especialidad
}

// POST /auth/register/profesional
export interface RegistroProfesionalRequest {
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  correo: string
  contraseña: string
  telefono: string
  nroMatricula?: string
  cbu?: string // CBU/CVU: 22 números
  descripcion?: string // "Sobre mí"
  idsEspecialidades: number[]
  idsTiposDeServicio: number[] // habilidades
  idsZonasCobertura: number[]
}
