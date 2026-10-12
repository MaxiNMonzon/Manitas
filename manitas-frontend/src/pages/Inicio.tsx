import { useAuth } from '../auth/useAuth'
import InicioCliente from './cliente/InicioCliente'
import InicioProfesional from './profesional/InicioProfesional'
import EnConstruccion from './EnConstruccion'

// Pestaña "Inicio": cada rol tiene su propia pantalla principal
export default function Inicio() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'cliente') return <InicioCliente />
  if (sesion?.rol === 'profesional') return <InicioProfesional />
  return <EnConstruccion titulo="Inicio" />
}
