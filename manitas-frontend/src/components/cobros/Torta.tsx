import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PieChart } from '@mui/x-charts/PieChart'
import { formatoPesos } from './estadosCobro'

// Torta (dona) con su referencia al lado: nombre, monto y porcentaje
export default function Torta({ datos, colores }: { datos: { nombre: string; monto: number }[]; colores: string[] }) {
  const suma = datos.reduce((s, d) => s + d.monto, 0)
  if (suma === 0) return <Typography color="text.secondary">Todavía no hay cobros para mostrar.</Typography>
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
              data: datos.map((d, i) => ({ id: d.nombre, value: d.monto, label: d.nombre, color: colores[i % colores.length] })),
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
        {datos.map((d, i) => (
          <Stack key={d.nombre} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colores[i % colores.length], flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
              {d.nombre}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatoPesos(d.monto)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 36, textAlign: 'right' }}>
              {Math.round((d.monto / suma) * 100)}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}