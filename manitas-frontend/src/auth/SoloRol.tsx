import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Rol } from '../types'

// Protege una pantalla según el nivel de acceso: si el rol de la sesión no está entre los permitidos,
// vuelve al inicio. (Layout ya exige sesión; esto separa lo de cliente, profesional y administrador.)
// Es solo para la experiencia de uso: la seguridad real la aplica el back con AuthGuard y RolesGuard
export default function SoloRol({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { sesion } = useAuth()
  if (!sesion || !roles.includes(sesion.rol)) return <Navigate to="/app" replace />
  return <>{children}</>
}
