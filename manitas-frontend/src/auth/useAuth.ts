import { createContext, useContext } from 'react'
import type { LoginRequest, Rol } from '../types'

export interface Sesion {
  correo: string
  rol: Rol
}

export interface AuthContextValue {
  sesion: Sesion | null
  // El rol no lo elige el front: lo devuelve el back
  login: (datos: LoginRequest) => Promise<void>
  logout: () => void
  // Después de cambiar el email en el perfil (el token sigue sirviendo)
  actualizarCorreo: (correo: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
