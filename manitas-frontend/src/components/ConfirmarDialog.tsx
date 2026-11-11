import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

interface Props {
  abierto: boolean
  titulo: string
  texto: string
  // El texto del botón rojo (ej: "Cancelar solicitud", "Dar de baja")
  boton: string
  // Mientras se manda, el botón muestra que está cargando
  cargando?: boolean
  onClose: () => void
  onConfirmar: () => void
}

// Preguntar antes de algo que no se puede deshacer (cancelar, rechazar, dar de baja)
export default function ConfirmarDialog({ abierto, titulo, texto, boton, cargando = false, onClose, onConfirmar }: Props) {
  return (
    <Dialog open={abierto} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Typography>{texto}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Volver</Button>
        <Button variant="contained" color="error" onClick={onConfirmar} loading={cargando}>
          {boton}
        </Button>
      </DialogActions>
    </Dialog>
  )
}