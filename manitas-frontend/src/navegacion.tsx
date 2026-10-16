import type { ReactElement } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'
import HelpCenterIcon from '@mui/icons-material/HelpCenter'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import type { Rol } from './types'

// Pestañas de la parte privada (siempre visibles con sesión iniciada).
// En celular van abajo (BottomNavigation); en pantallas grandes, en la barra superior.
export interface Pestaña {
  path: string // relativo a /app
  label: string
  icono: ReactElement
}

const pestañasCliente: Pestaña[] = [
  { path: '', label: 'Inicio', icono: <HomeIcon /> },
  { path: 'solicitudes', label: 'Solicitudes', icono: <AssignmentIcon /> },
  { path: 'pagos', label: 'Pagos', icono: <PaymentsIcon /> },
  { path: 'ayuda', label: 'Ayuda', icono: <HelpCenterIcon /> },
  { path: 'perfil', label: 'Mi perfil', icono: <AccountCircleIcon /> },
]

// Según el boceto del profesional ("Turnos" pasó a llamarse Agenda). La ayuda está
// como link al pie de su pantalla de inicio
const pestañasProfesional: Pestaña[] = [
  { path: '', label: 'Inicio', icono: <HomeIcon /> },
  { path: 'solicitudes', label: 'Solicitudes', icono: <AssignmentIcon /> },
  { path: 'agenda', label: 'Agenda', icono: <CalendarMonthIcon /> },
  { path: 'cobros', label: 'Cobros', icono: <RequestQuoteIcon /> },
  { path: 'perfil', label: 'Mi perfil', icono: <AccountCircleIcon /> },
]

export function pestañasDe(rol: Rol): Pestaña[] {
  return rol === 'profesional' ? pestañasProfesional : pestañasCliente
}

// Pestaña activa según la URL (ej: /app/pagos → 'pagos'). Las subpantallas que no son
// pestañas (ej: /app/profesionales) dejan marcado Inicio.
export function pestañaActiva(pathname: string, pestañas: Pestaña[]): string {
  const primerTramo = pathname.replace(/^\/app\/?/, '').split('/')[0]
  return pestañas.some((p) => p.path === primerTramo) ? primerTramo : ''
}