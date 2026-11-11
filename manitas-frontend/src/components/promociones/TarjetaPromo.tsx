import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { PromoBancaria } from '../../types'

interface Props {
  promo: PromoBancaria
  onVerCondiciones: () => void
  // Tamaño del círculo con la inicial del banco
  tamañoAvatar?: number
}

// Una promo bancaria: el banco, "X% de reintegro", el detalle y "Ver condiciones".
// La usan el Inicio del cliente y la pantalla de Promociones
export default function TarjetaPromo({ promo, onVerCondiciones, tamañoAvatar = 32 }: Props) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: promo.color, width: tamañoAvatar, height: tamañoAvatar, fontSize: tamañoAvatar / 2 }}>
            {promo.banco.replace('Banco ', '')[0]}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {promo.banco}
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
          {promo.titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {promo.detalle}
        </Typography>
        <Link component="button" variant="body2" onClick={onVerCondiciones} sx={{ mt: 1 }}>
          Ver condiciones
        </Link>
      </CardContent>
    </Card>
  )
}
