import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import PlaceIcon from '@mui/icons-material/Place'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'
import AvatarProfesional from './AvatarProfesional'

// Ventana flotante con el perfil del profesional (en celular ocupa toda la pantalla).
// Provisorio: el perfil completo (reseñas, habilidades, pedir presupuesto) se desarrolla después.
export default function PerfilProfesionalDialog({
  profesional,
  onClose,
}: {
  profesional: ProfesionalResumen | null
  onClose: () => void
}) {
  const theme = useTheme()
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={profesional !== null} onClose={onClose} fullWidth maxWidth="sm" fullScreen={pantallaChica}>
      {profesional && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            Perfil del profesional
            <IconButton aria-label="Cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <AvatarProfesional profesional={profesional} tamaño={96} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profesional.nombre} {profesional.apellido}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Rating value={profesional.calificacion} precision={0.5} readOnly />
                <Typography color="text.secondary">
                  {profesional.calificacion.toFixed(1)} · {profesional.cantidadCalificaciones} calificaciones
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                {profesional.especialidades.map((e) => (
                  <Chip key={e} label={e} color="primary" variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <PlaceIcon fontSize="small" />
                <Typography>{profesional.zona}</Typography>
              </Stack>
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 0.5 }}>
              Sobre mí y mi trabajo
            </Typography>
            {/* Se muestra como texto (no HTML), respetando los saltos de línea */}
            <Typography sx={{ whiteSpace: 'pre-line' }}>{profesional.descripcion}</Typography>

            <Alert severity="info" sx={{ mt: 3 }}>
              El perfil completo (reseñas, habilidades y pedir presupuesto) está en desarrollo.
            </Alert>
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}
