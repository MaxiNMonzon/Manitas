// Usuarios: login, registro y "Mi perfil" del cliente y del profesional

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

// GET /auth/perfil del profesional (sin la contraseña)
export interface PerfilProfesional {
  idUsuario: number
  dni: number
  nombre: string
  apellido: string
  fechaNacimiento: string // 'AAAA-MM-DD'
  correo: string
  telefono: string
  matriculas: { idMatricula?: number; numero: string; descripcion?: string | null; especialidad: { idEspecialidad: number; nombreEspecialidad: string } }[]
  costoVisita?: number | null
  descripcion?: string | null
  cbu?: string | null
  especialidades: { idEspecialidad: number; nombreEspecialidad: string }[]
  tiposDeServicio: { idServicio: number; nombreServicio: string; especialidad?: { idEspecialidad: number; nombreEspecialidad: string } }[]
  zonasDeCobertura: { idZona: number; nombreZona: string; localidad?: { nombreLocalidad: string } }[]
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