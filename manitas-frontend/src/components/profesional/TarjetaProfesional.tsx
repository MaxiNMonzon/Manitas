import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlaceIcon from '@mui/icons-material/Place'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'
import AvatarProfesional from './AvatarProfesional'

// Resumen del perfil de un profesional: foto, nombre, especialidades, zona y valoración
export default function TarjetaProfesional({
  profesional,
  onVerPerfil,
}: {
  profesional: ProfesionalResumen
  onVerPerfil: () => void
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <AvatarProfesional profesional={profesional} />
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {profesional.nombre} {profesional.apellido}
            </Typography>
            <Typography variant="body2" color="primary" noWrap>
              {profesional.especialidades.join(' · ')}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <PlaceIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" noWrap>
                {profesional.zona}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
          <Rating value={profesional.calificacion} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            {profesional.calificacion.toFixed(1)} ({profesional.cantidadCalificaciones})
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button fullWidth variant="outlined" onClick={onVerPerfil}>
          Ver perfil
        </Button>
      </CardActions>
    </Card>
  )
}
