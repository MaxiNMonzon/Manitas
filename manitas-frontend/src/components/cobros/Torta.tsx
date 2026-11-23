import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PieChart } from '@mui/x-charts/PieChart'
import { formatoPesos } from './estadosCobro'
import type { PorcionCobros } from '../../types'

// Torta (dona) con su referencia al lado: nombre, monto y porcentaje (los calcula el back)
export default function Torta({ datos, colores }: { datos: PorcionCobros[]; colores: string[] }) {
  if (datos.length === 0) return <Typography color="text.secondary">Todavía no hay cobros para mostrar.</Typography>
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 170, height: 170, flexShrink: 0 }}>
        <PieChart
          height={170}
          width={170}
          hideLegend
          margin={0}
          series={[
            {
              data: datos.map((porcion, indice) => ({ id: porcion.nombre, value: porcion.monto, label: porcion.nombre, color: colores[indice % colores.length] })),
              innerRadius: 48,
              outerRadius: 80,
              paddingAngle: 2,
              cornerRadius: 4,
              valueFormatter: (item) => formatoPesos(item.value),
            },
          ]}
        />
      </Box>
      <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
        {datos.map((porcion, indice) => (
          <Stack key={porcion.nombre} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colores[indice % colores.length], flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
              {porcion.nombre}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatoPesos(porcion.monto)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 36, textAlign: 'right' }}>
              {porcion.porcentaje}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
