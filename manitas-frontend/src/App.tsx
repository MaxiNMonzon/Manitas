import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import SoloRol from './auth/SoloRol'
import Layout from './components/Layout'
import Bienvenida from './pages/Bienvenida'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import MiPerfil from './pages/MiPerfil'
import Solicitudes from './pages/Solicitudes'
import Profesionales from './pages/cliente/Profesionales'
import Promociones from './pages/cliente/Promociones'
import AgendaProfesional from './pages/profesional/AgendaProfesional'
import CobrosProfesional from './pages/profesional/CobrosProfesional'
import PanelAdmin from './pages/admin/PanelAdmin'
import CatalogoAdmin from './pages/admin/CatalogoAdmin'
import ConsultasAdmin from './pages/admin/ConsultasAdmin'
import RegistroCliente from './pages/RegistroCliente'
import RegistroProfesional from './pages/RegistroProfesional'
import Pagos from './pages/Pagos'
import Ayuda from './pages/Ayuda'
import ResultadoPago from './pages/ResultadoPago'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Bienvenida />} />
          <Route path="login" element={<Login />} />
          <Route path="registro/cliente" element={<RegistroCliente />} />
          <Route path="registro/profesional" element={<RegistroProfesional />} />
          {/* Vuelta de Mercado Pago si el .env apunta a /solicitudes (sin /app): se reenvía con los datos del pago */}
          <Route path="solicitudes" element={<ResultadoPago />} />

          {/* Parte privada (requiere sesión). Cada pantalla, además, solo para los roles que la usan */}
          <Route path="app" element={<Layout />}>
            {/* Todos los roles (cada uno ve su versión) */}
            <Route index element={<Inicio />} />
            <Route path="perfil" element={<MiPerfil />} />
            <Route path="ayuda" element={<SoloRol roles={['cliente', 'profesional']}><Ayuda /></SoloRol>} />
            <Route path="solicitudes" element={<SoloRol roles={['cliente', 'profesional']}><Solicitudes /></SoloRol>} />
            {/* Cliente */}
            <Route path="pagos" element={<SoloRol roles={['cliente']}><Pagos /></SoloRol>} />
            <Route path="pagos/resultado" element={<ResultadoPago />} />
            <Route path="profesionales" element={<SoloRol roles={['cliente']}><Profesionales /></SoloRol>} />
            <Route path="promociones" element={<SoloRol roles={['cliente']}><Promociones /></SoloRol>} />
            {/* Profesional */}
            <Route path="agenda" element={<SoloRol roles={['profesional']}><AgendaProfesional /></SoloRol>} />
            <Route path="cobros" element={<SoloRol roles={['profesional']}><CobrosProfesional /></SoloRol>} />
            {/* Administrador */}
            <Route path="catalogos" element={<SoloRol roles={['admin']}><PanelAdmin /></SoloRol>} />
            <Route path="catalogos/:clave" element={<SoloRol roles={['admin']}><CatalogoAdmin /></SoloRol>} />
            <Route path="consultas" element={<SoloRol roles={['admin']}><ConsultasAdmin /></SoloRol>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
