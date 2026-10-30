import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import { darDeBajaCuenta } from '../../api/perfil'
import { useAuth } from '../../auth/useAuth'

const PALABRA = 'BAJA'

// Dar de baja la propia cuenta (DELETE /cliente/:id o /profesional/:id). Es un borrado lógico:
// el correo queda bloqueado. Pide escribir "BAJA" para que no se haga por error
export default function BajaCuentaButton({ idUsuario }: { idUsuario: number }) {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!sesion || sesion.rol === 'admin') return null
  const rol = sesion.rol

  const confirmar = async () => {
    setEnviando(true)
    setError(null)
    try {
      await darDeBajaCuenta(rol, idUsuario)
      logout()
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo dar de baja la cuenta')
      setEnviando(false)
    }
  }

  return (
    <>
      <Button color="error" startIcon={<PersonOffIcon />} onClick={() => setAbierto(true)}>
        Dar de baja mi cuenta
      </Button>
      <Dialog open={abierto} onClose={() => setAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Dar de baja tu cuenta?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {rol === 'profesional'
              ? 'Dejás de aparecer en las búsquedas y no vas a poder volver a entrar con este correo.'
              : 'No vas a poder volver a entrar con este correo.'}{' '}
            Tus solicitudes anteriores quedan guardadas.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label={`Escribí ${PALABRA} para confirmar`}
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAbierto(false)}>Volver</Button>
          <Button variant="contained" color="error" disabled={confirmacion.trim().toUpperCase() !== PALABRA} loading={enviando} onClick={confirmar}>
            Dar de baja
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
