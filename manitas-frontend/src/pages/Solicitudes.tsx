import { useAuth } from '../auth/useAuth'
import SolicitudesProfesional from './profesional/SolicitudesProfesional'
import SolicitudesCliente from './cliente/SolicitudesCliente'

// Pestaña "Solicitudes": cada rol tiene su propia pantalla
export default function Solicitudes() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'profesional') return <SolicitudesProfesional />
  return <SolicitudesCliente />
}
