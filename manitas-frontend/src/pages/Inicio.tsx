import { useAuth } from '../auth/useAuth'
import InicioCliente from './cliente/InicioCliente'
import InicioProfesional from './profesional/InicioProfesional'
import PanelAdmin from './admin/PanelAdmin'

// Pestaña "Inicio": cada rol tiene su propia pantalla principal
export default function Inicio() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'profesional') return <InicioProfesional />
  if (sesion?.rol === 'admin') return <PanelAdmin />
  return <InicioCliente />
}
