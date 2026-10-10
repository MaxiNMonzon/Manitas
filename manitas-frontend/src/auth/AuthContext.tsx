import { useState, type ReactNode } from 'react'
import { api, tokenStorage } from '../api/client'
import type { LoginRequest, LoginResponse, Rol } from '../types'
import { AuthContext, type Sesion } from './useAuth'

const SESION_KEY = 'manitas.sesion'

function leerSesion(): Sesion | null {
  if (!tokenStorage.get()) return null
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  const guardarSesion = (token: string, nueva: Sesion) => {
    tokenStorage.set(token)
    localStorage.setItem(SESION_KEY, JSON.stringify(nueva))
    setSesion(nueva)
  }

  const login = async (rol: Rol, datos: LoginRequest) => {
    // El backend tiene un endpoint de login distinto para cada rol
    const { token, correo } = await api.post<LoginResponse>(`/auth/login/${rol}`, datos)
    guardarSesion(token, { correo, rol })
  }

  // PROVISORIO: sesión falsa (sin backend) para recorrer las pantallas mientras no hay datos.
  // El token 'demo' no sirve para el back: las pantallas privadas reales van a dar 401.
  const loginDemo = (rol: Rol) => guardarSesion('demo', { correo: `demo.${rol}@manitas.com`, rol })

  const logout = () => {
    tokenStorage.clear()
    localStorage.removeItem(SESION_KEY)
    setSesion(null)
  }

  return <AuthContext.Provider value={{ sesion, login, loginDemo, logout }}>{children}</AuthContext.Provider>
}
