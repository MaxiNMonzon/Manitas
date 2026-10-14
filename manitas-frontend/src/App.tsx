import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import Bienvenida from './pages/Bienvenida'
import Login from './pages/Login'
import EnConstruccion from './pages/EnConstruccion'
import Inicio from './pages/Inicio'
import MiPerfil from './pages/MiPerfil'
import Solicitudes from './pages/Solicitudes'
import AgendaProfesional from './pages/profesional/AgendaProfesional'
import CobrosProfesional from './pages/profesional/CobrosProfesional'
import RegistroCliente from './pages/RegistroCliente'
import RegistroProfesional from './pages/RegistroProfesional'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Bienvenida />} />
          <Route path="login" element={<Login />} />
          <Route path="registro/cliente" element={<RegistroCliente />} />
          <Route path="registro/profesional" element={<RegistroProfesional />} />

          {/* Parte privada (requiere sesión) */}
          <Route path="app" element={<Layout />}>
            {/* Pestañas */}
            <Route index element={<Inicio />} />
            <Route path="solicitudes" element={<Solicitudes />} />
            <Route path="pagos" element={<EnConstruccion titulo="Pagos" />} />
            <Route path="ayuda" element={<EnConstruccion titulo="Información y preguntas frecuentes" />} />
            <Route path="perfil" element={<MiPerfil />} />
            {/* Pestañas del profesional */}
            <Route path="agenda" element={<AgendaProfesional />} />
            <Route path="cobros" element={<CobrosProfesional />} />
            {/* Subpantallas */}
            <Route path="profesionales" element={<EnConstruccion titulo="Profesionales" />} />
            <Route path="promociones" element={<EnConstruccion titulo="Promociones bancarias" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
