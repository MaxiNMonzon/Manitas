import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { BarChart } from '@mui/x-charts/BarChart'
import dayjs, { type Dayjs } from 'dayjs'
import SeccionTarjeta from '../SeccionTarjeta'
import Torta from './Torta'
import { formatoPesos, pesosCorto } from './estadosCobro'
import { agrupar, capitalizar, inicioHistorial, MESES_HISTORIAL, pagados, porMes } from './calculos'
import type { Cobro } from '../../types'

interface Props {
  todos: Cobro[]
  hoy: Dayjs
  cuentaDeposito: string | null
  // Al tocar un mes (en el gráfico o en el resumen) se ven sus cobros
  onElegirMes: (mes: Dayjs) => void
}

// Pestaña "Historial": gráficos de lo cobrado en los últimos 6 meses
export default function HistorialCobros({ todos, hoy, cuentaDeposito, onElegirMes }: Props) {
  const theme = useTheme()
  const meses = porMes(todos, hoy)
  const recientes = pagados(todos).filter((c) => !dayjs(c.fechaPago).isBefore(inicioHistorial(hoy)))
  const coloresTorta = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.error.light]

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <SeccionTarjeta titulo="Ingresos por mes">
          <BarChart
            height={280}
            borderRadius={6}
            margin={{ left: 0, right: 8 }}
            xAxis={[{ scaleType: 'band', data: meses.map((m) => capitalizar(m.mes.format('MMM'))) }]}
            yAxis={[{ valueFormatter: (v: number) => pesosCorto(v), width: 48 }]}
            series={[
              { data: meses.map((m) => m.trabajos), label: 'Trabajos', stack: 'total', color: theme.palette.primary.main, valueFormatter: (v) => formatoPesos(v ?? 0) },
              { data: meses.map((m) => m.visitas), label: 'Visitas', stack: 'total', color: theme.palette.secondary.main, valueFormatter: (v) => formatoPesos(v ?? 0) },
            ]}
            onItemClick={(_, item) => onElegirMes(meses[item.dataIndex].mes)}
          />
          <Typography variant="caption" color="text.secondary">
            Tocá una barra para ver los cobros de ese mes.
          </Typography>
        </SeccionTarjeta>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <SeccionTarjeta titulo="Resumen por mes">
          <Stack spacing={0.5}>
            {[...meses].reverse().map((m, i, lista) => {
              const anterior = lista[i + 1]
              const cambio = anterior && anterior.total > 0 ? Math.round(((m.total - anterior.total) / anterior.total) * 100) : null
              return (
                <ButtonBase
                  key={m.mes.format('YYYY-MM')}
                  onClick={() => onElegirMes(m.mes)}
                  sx={{ justifyContent: 'stretch', textAlign: 'left', borderRadius: 1, px: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {capitalizar(m.mes.format('MMMM YYYY'))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.cantidad} cobro{m.cantidad === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                    {cambio != null && <Chip size="small" variant="outlined" color={cambio >= 0 ? 'success' : 'error'} label={`${cambio >= 0 ? '+' : ''}${cambio}%`} />}
                    <Typography sx={{ fontWeight: 700, minWidth: 96, textAlign: 'right' }}>{formatoPesos(m.total)}</Typography>
                    <ChevronRightIcon fontSize="small" color="action" />
                  </Stack>
                </ButtonBase>
              )
            })}
          </Stack>
        </SeccionTarjeta>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <SeccionTarjeta titulo="Por especialidad">
          <Torta datos={agrupar(recientes, (c) => c.especialidad ?? 'Otras')} colores={coloresTorta} />
        </SeccionTarjeta>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SeccionTarjeta titulo="Medios de pago">
          <Torta datos={agrupar(recientes, (c) => c.medioDePago ?? 'Mercado Pago')} colores={coloresTorta} />
        </SeccionTarjeta>
      </Grid>
      <Grid size={12}>
        <Typography variant="caption" color="text.secondary">
          Los gráficos muestran lo que pagaron tus clientes en los últimos {MESES_HISTORIAL} meses. El depósito llega a tu
          CBU/CVU{cuentaDeposito ? ` terminado en ${cuentaDeposito}` : ''} a los 3 días hábiles de cada pago.
        </Typography>
      </Grid>
    </Grid>
  )
}
