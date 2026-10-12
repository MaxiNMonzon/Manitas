import { useAuth } from '../auth/useAuth'
import SolicitudesProfesional from './profesional/SolicitudesProfesional'
import EnConstruccion from './EnConstruccion'

// Pestaña "Solicitudes": cada rol tiene su propia pantalla
export default function Solicitudes() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'profesional') return <SolicitudesProfesional />
  return <EnConstruccion titulo="Solicitudes" />
}
