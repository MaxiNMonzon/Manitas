import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

export interface Aviso {
  texto: string
  tipo: 'success' | 'error' | 'warning'
}

interface Props {
  // Con null no se muestra nada
  aviso: Aviso | null
  onClose: () => void
  // Cuánto queda a la vista (milisegundos)
  duracion?: number
}

// El cartel de arriba que confirma cómo salió algo ("Perfil actualizado", "Solicitud cancelada"...)
export default function AvisoFlotante({ aviso, onClose, duracion = 5000 }: Props) {
  return (
    <Snackbar open={aviso !== null} autoHideDuration={duracion} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      {aviso ? (
        <Alert severity={aviso.tipo} variant="filled" onClose={onClose}>
          {aviso.texto}
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
