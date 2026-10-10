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
