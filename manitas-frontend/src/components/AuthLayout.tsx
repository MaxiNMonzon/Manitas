import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Marca from './Marca'
import IconoEspecialidad from './IconoEspecialidad'
import { degradadoMarca } from '../theme'

// Los mismos 10 oficios que carga el seed (el ícono sale de IconoEspecialidad)
const oficios = [
  'Plomería', 'Electricidad', 'Gas', 'Pintura', 'Albañilería',
  'Carpintería', 'Cerrajería', 'Climatización', 'Limpieza', 'Jardinería',
]

// Medidas de la pantalla, con nombre (los colores y espaciados salen del tema)
const LADO_AZULEJO = 96
const ANCHO_TEXTO = 520
const ANCHO_TARJETA = { normal: 440, ancho: 760 }

// Los estilos de cada parte, separados del JSX
const estilos = {
  pantalla: { minHeight: '100vh', display: 'flex' },
  // Panel de presentación de la izquierda, con el degradado de la marca
  presentacion: {
    flex: 1.1,
    flexDirection: 'column',
    // Arriba, a la misma altura que la tarjeta de la derecha (si no, en el login queda muy abajo)
    justifyContent: 'flex-start',
    gap: 5,
    p: 8,
    pt: 13,
    color: 'common.white',
    background: degradadoMarca,
  },
  frase: { fontWeight: 700, mb: 2, maxWidth: ANCHO_TEXTO },
  subtitulo: { opacity: 0.85, fontWeight: 400, maxWidth: ANCHO_TEXTO },
  // 10 oficios: 5 columnas x 2 filas
  grillaOficios: { display: 'grid', gridTemplateColumns: `repeat(5, ${LADO_AZULEJO}px)`, gap: 1.5 },
  // Cada oficio: un recuadro de vidrio translúcido sobre el degradado
  azulejo: {
    alignItems: 'center',
    justifyContent: 'center',
    height: LADO_AZULEJO,
    borderRadius: 3,
    bgcolor: 'vidrio.fondo',
    backdropFilter: 'blur(4px)',
    border: 1,
    borderColor: 'vidrio.borde',
  },
  // Lado derecho, donde va el formulario
  contenido: {
    flex: 1,
    display: 'flex',
    // En pantallas grandes la tarjeta arranca arriba, pareja con la frase de la izquierda
    alignItems: { xs: 'center', md: 'flex-start' },
    justifyContent: 'center',
    p: { xs: 2, sm: 4 },
    pt: { md: 8 },
    bgcolor: 'grey.50',
  },
  tarjeta: { width: '100%', p: { xs: 3, sm: 5 }, border: 1, borderColor: 'divider' },
  volver: { mb: 1, ml: -1 },
  marca: { mb: 4, display: 'flex', justifyContent: 'center' },
} satisfies Record<string, SxProps<Theme>>

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
    <Box sx={estilos.pantalla}>
      <Box sx={[estilos.presentacion, { display: { xs: 'none', [ancho ? 'lg' : 'md']: 'flex' } }]}>
        <Box>
          <Typography variant="h3" sx={estilos.frase}>
            Los expertos que necesitás, a un paso de tu hogar.
          </Typography>
          <Typography variant="h6" sx={estilos.subtitulo}>
            Accedé a profesionales calificados, solicitá presupuestos y encontrá soluciones al instante.
          </Typography>
        </Box>
        <Box sx={estilos.grillaOficios}>
          {oficios.map((nombre) => (
            <Stack key={nombre} spacing={1} sx={estilos.azulejo}>
              <IconoEspecialidad nombre={nombre} fontSize="large" />
              <Typography variant="caption">{nombre}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>

      <Box sx={estilos.contenido}>
        <Paper elevation={0} sx={[estilos.tarjeta, { maxWidth: ancho ? ANCHO_TARJETA.ancho : ANCHO_TARJETA.normal }]}>
          {volverA && (
            <Button component={RouterLink} to={volverA} startIcon={<ArrowBackIcon />} size="small" sx={estilos.volver}>
              Volver
            </Button>
          )}
          <Box sx={estilos.marca}>
            <Marca alto={{ xs: 56, sm: 72 }} />
          </Box>
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
