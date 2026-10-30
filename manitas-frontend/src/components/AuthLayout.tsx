import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Marca from './Marca'
import IconoEspecialidad from './IconoEspecialidad'

// Los mismos 10 oficios que carga el seed (el ícono sale de IconoEspecialidad)
const oficios = [
  'Plomería', 'Electricidad', 'Gas', 'Pintura', 'Albañilería',
  'Carpintería', 'Cerrajería', 'Climatización', 'Limpieza', 'Jardinería',
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
          // Arriba, a la misma altura que la tarjeta de la derecha (si no, en el login queda muy abajo)
          justifyContent: 'flex-start',
          gap: 5,
          p: 8,
          pt: 13,
          color: 'common.white',
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${t.palette.secondary.main} 130%)`,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, maxWidth: 520 }}>
            Los expertos que necesitás, a un paso de tu hogar.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, maxWidth: 520 }}>
            Accedé a profesionales calificados, solicitá presupuestos y encontrá soluciones al instante.
          </Typography>
        </Box>
        {/* 10 oficios: 5 columnas x 2 filas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 96px)', gap: 1.5 }}>
          {oficios.map((nombre) => (
            <Stack
              key={nombre}
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                height: 96,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <IconoEspecialidad nombre={nombre} fontSize="large" />
              <Typography variant="caption">{nombre}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          // En pantallas grandes la tarjeta arranca arriba, pareja con la frase de la izquierda
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          pt: { md: 8 },
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