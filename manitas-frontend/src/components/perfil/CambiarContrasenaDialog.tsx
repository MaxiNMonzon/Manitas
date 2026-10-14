import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { cambiarContraseña } from '../../api/perfil'

interface Props {
  open: boolean
  onClose: () => void
  onCambiada: () => void
}

// Pide la contraseña actual y la nueva dos veces (el back verifica la actual)
export default function CambiarContraseñaDialog({ open, onClose, onCambiada }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {/* Se arma de nuevo cada vez que se abre: así arranca vacío */}
      {open && <Formulario onClose={onClose} onCambiada={onCambiada} />}
    </Dialog>
  )
}

function Formulario({ onClose, onCambiada }: Omit<Props, 'open'>) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const errores = {
    actual: !actual ? 'Ingresá tu contraseña actual' : undefined,
    nueva: nueva.length < 8 ? 'Mínimo 8 caracteres' : nueva === actual ? 'Tiene que ser distinta de la actual' : undefined,
    repetir: repetir !== nueva ? 'Las contraseñas no coinciden' : undefined,
  }
  const hayErrores = Object.values(errores).some(Boolean)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIntento(true)
    setError(null)
    if (hayErrores) return
    setEnviando(true)
    try {
      await cambiarContraseña(actual, nueva)
      onCambiada()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setEnviando(false)
    }
  }

  const props = (valor: string, set: (v: string) => void, err: string | undefined) => ({
    value: valor,
    onChange: (e: { target: { value: string } }) => set(e.target.value),
    error: intento && Boolean(err),
    helperText: intento ? err : undefined,
    type: 'password',
    fullWidth: true,
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Contraseña actual" autoComplete="current-password" autoFocus {...props(actual, setActual, errores.actual)} />
          <TextField label="Contraseña nueva" autoComplete="new-password" {...props(nueva, setNueva, errores.nueva)} />
          <TextField label="Repetir la nueva" autoComplete="new-password" {...props(repetir, setRepetir, errores.repetir)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" loading={enviando}>
          Cambiar
        </Button>
      </DialogActions>
    </form>
  )
}
