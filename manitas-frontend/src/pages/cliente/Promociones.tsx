import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { traerPromocionesDelMes } from '../../api/promociones'
import { useCarga } from '../../hooks/useCarga'

// Todas las promociones bancarias vigentes este mes (CUU "Informar promociones bancarias del mes").
// El reintegro lo hace el banco al pagar con ese medio
export default function Promociones() {
  const promociones = useCarga('promociones-del-mes', traerPromocionesDelMes)
  // El nombre del mes se calcula una sola vez al entrar
  const [mes] = useState(() => new Date().toLocaleDateString('es-AR', { month: 'long' }))

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Promociones bancarias de {mes}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Pagando tus servicios con estos medios, tu banco te reintegra parte del pago.
      </Typography>

      {promociones.error && <Alert severity="error">{promociones.error}</Alert>}
      {promociones.cargando ? (
        <Skeleton variant="rounded" height={160} />
      ) : (promociones.datos ?? []).length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Este mes no hay promociones vigentes.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {(promociones.datos ?? []).map((promo) => (
            <Grid key={promo.idPromocion} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: promo.color, width: 32, height: 32, fontSize: 15 }}>{promo.banco.replace('Banco ', '')[0]}</Avatar>
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}