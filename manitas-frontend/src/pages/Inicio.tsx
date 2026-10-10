import { useAuth } from '../auth/useAuth'
import InicioCliente from './cliente/InicioCliente'
import EnConstruccion from './EnConstruccion'

// Pestaña "Inicio": cada rol tiene su propia pantalla principal
export default function Inicio() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'cliente') return <InicioCliente />
  return <EnConstruccion titulo="Inicio" descripcion="La pantalla principal del profesional está en construcción." />
}
