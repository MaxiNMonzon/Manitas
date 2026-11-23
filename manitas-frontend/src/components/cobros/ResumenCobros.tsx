import type { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CalculateIcon from '@mui/icons-material/Calculate'
import PaymentsIcon from '@mui/icons-material/Payments'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import dayjs, { type Dayjs } from 'dayjs'
import { formatoPesos } from './estadosCobro'
import type { ResumenCobros as Resumen } from '../../types'

// Una tarjeta del resumen: ícono, título, número grande y un detalle chico
function Metrica({ icono, titulo, valor, detalle, color }: { icono: ReactElement; titulo: string; valor: string; detalle: ReactNode; color: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color, mb: 1 }}>
        {icono}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {valor}
      </Typography>
      <Box sx={{ typography: 'caption', color: 'text.secondary' }}>{detalle}</Box>
    </Paper>
  )
}

// Arriba de "Mis cobros": ingresos del mes (y cuánto cambió), pendiente de cobro y promedio por trabajo.
// Los números ya vienen calculados del back (resumen de GET /solicitud-de-servicio/cobros)
export default function ResumenCobros({ resumen, hoy, cargando }: { resumen: Resumen | null; hoy: Dayjs; cargando: boolean }) {
  if (cargando || !resumen) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2].map((indice) => (
          <Grid key={indice} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={104} />
          </Grid>
        ))}
      </Grid>
    )
  }

  const mesAnterior = hoy.subtract(1, 'month')

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Metrica
          icono={<PaymentsIcon />}
          titulo={`Ingresos de ${hoy.format('MMMM')}`}
          valor={formatoPesos(resumen.ingresosMes)}
          color="success.main"
          detalle={
            resumen.variacionMes == null ? (
              'Sin cobros el mes anterior'
            ) : (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: resumen.variacionMes >= 0 ? 'success.main' : 'error.main' }}>
                {resumen.variacionMes >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                <span>
                  {resumen.variacionMes >= 0 ? '+' : ''}
                  {resumen.variacionMes}% vs {mesAnterior.format('MMMM')}
                </span>
              </Stack>
            )
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Metrica
          icono={<AccountBalanceIcon />}
          titulo="Pendiente de cobro"
          valor={formatoPesos(resumen.pendiente.monto)}
          color="warning.main"
          detalle={
            resumen.pendiente.cantidad === 0
              ? 'No tenés cobros pendientes'
              : `${resumen.pendiente.cantidad} cobro${resumen.pendiente.cantidad === 1 ? '' : 's'}` +
                (resumen.pendiente.proximoDeposito ? ` · próximo depósito: ${dayjs(resumen.pendiente.proximoDeposito).format('ddd DD/MM')}` : '')
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Metrica
          icono={<CalculateIcon />}
          titulo="Promedio por trabajo"
          valor={formatoPesos(resumen.promedioPorTrabajo.monto)}
          color="primary.main"
          detalle={`${resumen.promedioPorTrabajo.trabajos} trabajos en los últimos ${resumen.promedioPorTrabajo.meses} meses`}
        />
      </Grid>
    </Grid>
  )
}