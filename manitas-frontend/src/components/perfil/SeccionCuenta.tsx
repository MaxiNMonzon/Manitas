import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import KeyIcon from '@mui/icons-material/Key'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../auth/useAuth'
import SeccionTarjeta from '../SeccionTarjeta'
import CambiarContrasenaDialog from './CambiarContrasenaDialog'
import BajaCuentaButton from './BajaCuentaButton'

interface Props {
  idUsuario: number
  onContraseñaCambiada: () => void
}

// Al pie de "Mi perfil" (cliente y profesional): cambiar la contraseña, cerrar sesión y dar de baja la cuenta
export default function SeccionCuenta({ idUsuario, onContraseñaCambiada }: Props) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [contraseñaAbierta, setContraseñaAbierta] = useState(false)

  return (
    <SeccionTarjeta titulo="Cuenta">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="outlined" startIcon={<KeyIcon />} onClick={() => setContraseñaAbierta(true)}>
          Cambiar contraseña
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          Cerrar sesión
        </Button>
      </Stack>
      <BajaCuentaButton idUsuario={idUsuario} />

      <CambiarContrasenaDialog
        open={contraseñaAbierta}
        onClose={() => setContraseñaAbierta(false)}
        onCambiada={() => {
          setContraseñaAbierta(false)
          onContraseñaCambiada()
        }}
      />
    </SeccionTarjeta>
  )
}
