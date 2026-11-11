import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { Fila } from '../../api/catalogos'
import type { Catalogo } from '../../pages/admin/catalogos'

interface Props {
  catalogo: Catalogo
  // La fila elegida; con null el diálogo está cerrado
  fila: Fila | null
  // En celular ocupa toda la pantalla
  angosto: boolean
  onClose: () => void
  onEditar: (f: Fila) => void
  onBorrar: (f: Fila) => void
}

// Detalle de una fila del catálogo: todos sus datos (columnas + los extra del detalle) y, si se puede, editar o dar de baja
export default function DetalleFilaDialog({ catalogo, fila, angosto, onClose, onEditar, onBorrar }: Props) {
  return (
    <Dialog open={fila !== null} onClose={onClose} fullWidth maxWidth="sm" fullScreen={angosto}>
      {fila && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            {catalogo.columnas[0].valor(fila)}
            <IconButton aria-label="Cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1}>
              {[...catalogo.columnas.map((c) => [c.label, c.valor(fila)] as [string, string]), ...(catalogo.detalle?.(fila) ?? [])]
                // Sin repetir datos que ya están en las columnas
                .filter(([label], i, todos) => todos.findIndex(([l]) => l === label) === i)
                .map(([label, valor]) => (
                  <Stack key={label} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right', whiteSpace: 'pre-line' }}>
                      {valor}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          </DialogContent>
          {!catalogo.soloLectura && (
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => onBorrar(fila)} sx={{ mr: 'auto' }}>
                Dar de baja
              </Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEditar(fila)}>
                Editar
              </Button>
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  )
}