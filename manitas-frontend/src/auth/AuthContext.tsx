import { useState, type ReactNode } from 'react'
import { api } from '../api/client'
import { sesionStorage, tokenStorage } from '../api/almacenamiento'
import type { LoginRequest, LoginResponse } from '../types'
import { AuthContext, type Sesion } from './useAuth'

// La sesión guardada solo vale si también está el token
const leerSesion = (): Sesion | null => (tokenStorage.get() ? sesionStorage.get() : null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  const guardarSesion = (token: string, nueva: Sesion) => {
    tokenStorage.set(token)
    sesionStorage.set(nueva)
    setSesion(nueva)
  }

  // Un solo login: el front manda correo y contraseña, y el back dice qué rol tiene la cuenta
  // (admin, cliente o profesional). El front no elige el rol
  const login = async (datos: LoginRequest) => {
    const { token, correo, rol } = await api.post<LoginResponse>('/auth/login', datos)
    guardarSesion(token, { correo, rol })
  }

  const logout = () => {
    tokenStorage.clear()
    sesionStorage.clear()
    setSesion(null)
  }

  const actualizarCorreo = (correo: string) => {
    if (!sesion) return
    const nueva = { ...sesion, correo }
    sesionStorage.set(nueva)
    setSesion(nueva)
  }

  return <AuthContext.Provider value={{ sesion, login, logout, actualizarCorreo }}>{children}</AuthContext.Provider>
}