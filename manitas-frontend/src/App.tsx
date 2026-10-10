import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import Bienvenida from './pages/Bienvenida'
import Login from './pages/Login'
import Panel from './pages/Panel'
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
            <Route index element={<Panel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
