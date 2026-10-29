import { useAuth } from '../auth/useAuth'
import PerfilProfesional from './profesional/PerfilProfesional'
import PerfilCliente from './cliente/PerfilCliente'

// Pestaña "Mi perfil": cada rol tiene su propia pantalla
export default function MiPerfil() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'profesional') return <PerfilProfesional />
  return <PerfilCliente />
}
