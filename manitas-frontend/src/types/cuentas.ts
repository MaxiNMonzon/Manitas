// Usuarios: login, registro y "Mi perfil" del cliente y del profesional

export type Rol = 'cliente' | 'profesional' | 'admin'

// POST /auth/login (uno solo para todos)
export interface LoginRequest {
  correo: string
  contraseña: string
}

export interface LoginResponse {
  token: string
  correo: string
  rol: Rol // lo averigua el back con el correo
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

// POST /auth/register/profesional
export interface RegistroProfesionalRequest {
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  correo: string
  contraseña: string
  telefono: string
  matriculas?: MatriculaRequest[]
  cbu?: string // CBU/CVU: 22 números
  descripcion?: string // "Sobre mí"
  idsEspecialidades: number[]
  idsTiposDeServicio: number[] // habilidades
  idsZonasCobertura: number[]
}

// Una matrícula del profesional, de una de sus especialidades
export interface MatriculaRequest {
  numero: string
  descripcion?: string
  idEspecialidad: number
}

// Cómo vienen las especialidades, habilidades y zonas dentro del perfil del profesional.
// Los formularios (registro y "Mi perfil") trabajan con esta misma forma: no hay que convertirlas
export interface EspecialidadResumen {
  idEspecialidad: number
  nombreEspecialidad: string
}

export interface HabilidadResumen {
  idServicio: number
  nombreServicio: string
  especialidad?: EspecialidadResumen
}

export interface ZonaResumen {
  idZona: number
  nombreZona: string
  localidad?: { nombreLocalidad: string }
}

// GET /auth/perfil del profesional (sin la contraseña)
export interface PerfilProfesional {
  idUsuario: number
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // 'AAAA-MM-DD'
  correo: string
  telefono: string
  matriculas: { idMatricula?: number; numero: string; descripcion?: string | null; especialidad: EspecialidadResumen }[]
  costoVisita?: number | null
  descripcion?: string | null
  cbu?: string | null
  especialidades: EspecialidadResumen[]
  tiposDeServicio: HabilidadResumen[]
  zonasDeCobertura: ZonaResumen[]
}

// PATCH /profesional/:id (null = borrar el dato opcional)
export interface CambiosPerfilProfesional {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  matriculas: MatriculaRequest[]
  costoVisita: number | null
  descripcion: string | null
  cbu: string | null
  idsEspecialidades: number[]
  idsTiposDeServicio: number[]
  idsZonasCobertura: number[]
}

// GET /auth/perfil del cliente (sin la contraseña)
export interface PerfilCliente {
  idUsuario: number
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // 'AAAA-MM-DD'
  correo: string
  telefono: string
  calle: string
  altura: number
  piso?: string | null
  depto?: string | null
  zonaResidencia: {
    idZona: number
    nombreZona: string
    localidad: {
      idLocalidad: number
      codigoPostal: string | null
      nombreLocalidad: string
      provincia: {
        idProvincia: number
        nombreProvincia: string
      }
    }
  }
}

// PATCH /cliente/:id (null = borrar el dato opcional)
export interface CambiosPerfilCliente {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  calle: string
  altura: number
  piso: string | null
  depto: string | null
  idZonaResidencia: number
}