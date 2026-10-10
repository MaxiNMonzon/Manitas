import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlumbingIcon from '@mui/icons-material/Plumbing'
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices'
import FormatPaintIcon from '@mui/icons-material/FormatPaint'
import CarpenterIcon from '@mui/icons-material/Carpenter'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Marca from './Marca'

const oficios = [
  { icono: <PlumbingIcon fontSize="large" />, nombre: 'Plomería' },
  { icono: <ElectricalServicesIcon fontSize="large" />, nombre: 'Electricidad' },
  { icono: <FormatPaintIcon fontSize="large" />, nombre: 'Pintura' },
  { icono: <CarpenterIcon fontSize="large" />, nombre: 'Carpintería' },
  { icono: <CleaningServicesIcon fontSize="large" />, nombre: 'Limpieza' },
  { icono: <AcUnitIcon fontSize="large" />, nombre: 'Climatización' },
]

// Pantalla dividida: panel de imagen a la izquierda y el contenido (formularios) a la derecha.
// En celulares el panel de imagen se oculta. `volverA` muestra el botón "Volver" arriba.
// `ancho` es para formularios grandes (registro): la tarjeta es más ancha y el panel
// de imagen solo aparece en pantallas grandes.
interface Props {
  children: ReactNode
  volverA?: string
  ancho?: boolean
}

export default function AuthLayout({ children, volverA, ancho = false }: Props) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Box
        sx={{
          flex: 1.1,
          display: { xs: 'none', [ancho ? 'lg' : 'md']: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 5,
          p: 8,
          color: 'common.white',
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${t.palette.secondary.main} 130%)`,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, maxWidth: 520 }}>
            El profesional que tu casa necesita, cuando lo necesitás.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, maxWidth: 520 }}>
            Pedí servicios urgentes o programados, compará presupuestos y calificá a quien te ayudó.
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 120px)', gap: 2 }}>
          {oficios.map((o) => (
            <Stack
              key={o.nombre}
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                height: 110,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {o.icono}
              <Typography variant="body2">{o.nombre}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          bgcolor: 'grey.50',
        }}
      >
        <Paper elevation={0} sx={{ width: '100%', maxWidth: ancho ? 760 : 440, p: { xs: 3, sm: 5 }, border: 1, borderColor: 'divider' }}>
          {volverA && (
            <Button component={RouterLink} to={volverA} startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1, ml: -1 }}>
              Volver
            </Button>
          )}
          <Box sx={{ mb: 4 }}>
            <Marca />
          </Box>
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
