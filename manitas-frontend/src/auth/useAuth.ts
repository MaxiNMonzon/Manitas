import { createContext, useContext } from 'react'
import type { LoginRequest, Rol } from '../types'

export interface Sesion {
  correo: string
  rol: Rol
}

export interface AuthContextValue {
  sesion: Sesion | null
  login: (rol: Rol, datos: LoginRequest) => Promise<void>
  loginDemo: (rol: Rol) => void // PROVISORIO, ver AuthContext
  logout: () => void
  // Después de cambiar el email en el perfil (el token sigue sirviendo)
  actualizarCorreo: (correo: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
