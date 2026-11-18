import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@emotion/react'

// Medidor tipo velocímetro para la calificación promedio (de 1 a 5 estrellas).
// 5 franjas de rojo a verde y una aguja que apunta al promedio.

const CX = 100 // centro del semicírculo (en el viewBox de 200 x 112)
const CY = 100
const RADIO_EXTERNO = 92
const RADIO_INTERNO = 60
const LARGO_AGUJA = 74
const MINIMO = 1
const MAXIMO = 5

// La aguja entra girando desde la izquierda
const entrar = keyframes`from { transform: rotate(0deg); }`

// Punto del semicírculo: 0 = extremo izquierdo, 1 = extremo derecho
function punto(radio: number, fraccion: number) {
  const angulo = Math.PI * (1 - fraccion)
  return { x: CX + radio * Math.cos(angulo), y: CY - radio * Math.sin(angulo) }
}

// Franja del medidor entre dos fracciones (un "pedazo de dona")
function franja(desde: number, hasta: number) {
  const a = punto(RADIO_EXTERNO, desde)
  const b = punto(RADIO_EXTERNO, hasta)
  const c = punto(RADIO_INTERNO, hasta)
  const d = punto(RADIO_INTERNO, desde)
  return `M ${a.x} ${a.y} A ${RADIO_EXTERNO} ${RADIO_EXTERNO} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${RADIO_INTERNO} ${RADIO_INTERNO} 0 0 0 ${d.x} ${d.y} Z`
}

export default function MedidorCalificacion({ promedio, cantidad }: { promedio: number | null; cantidad: number }) {
  const theme = useTheme()
  const niveles = [
    { nombre: 'Mala', color: theme.palette.error.main },
    { nombre: 'Regular', color: theme.palette.secondary.main },
    { nombre: 'Buena', color: '#fbc02d' },
    { nombre: 'Muy buena', color: '#7cb342' },
    { nombre: 'Excelente', color: theme.palette.success.main },
  ]

  const tiene = promedio != null
  const fraccion = tiene ? (Math.min(Math.max(promedio, MINIMO), MAXIMO) - MINIMO) / (MAXIMO - MINIMO) : 0
  const nivel = niveles[Math.min(niveles.length - 1, Math.floor(fraccion * niveles.length))]
  const separacion = 0.006 // pequeño espacio entre franjas
  const puntaAguja = punto(LARGO_AGUJA, 0) // la aguja se dibuja apuntando a la izquierda y se gira

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box
        component="svg"
        viewBox="0 0 200 112"
        role="img"
        aria-label={tiene ? `Calificación ${promedio} de 5: ${nivel.nombre}` : 'Sin calificaciones'}
        sx={{ width: { xs: 140, sm: 150 }, flexShrink: 0, display: 'block' }}
      >
        {niveles.map((n, i) => (
          <path
            key={n.nombre}
            d={franja(i / niveles.length + (i ? separacion : 0), (i + 1) / niveles.length - (i < niveles.length - 1 ? separacion : 0))}
            fill={tiene ? n.color : theme.palette.grey[300]}
            opacity={tiene && n !== nivel ? 0.55 : 1}
          />
        ))}
        {tiene && (
          <Box
            component="g"
            sx={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${fraccion * 180}deg)`,
              animation: `${entrar} 1s ease-out`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <path
              d={`M ${CX} ${CY - 5} L ${puntaAguja.x} ${puntaAguja.y} L ${CX} ${CY + 5} Z`}
              fill={theme.palette.grey[800]}
            />
          </Box>
        )}
        <circle cx={CX} cy={CY} r={11} fill={theme.palette.grey[800]} />
        <circle cx={CX} cy={CY} r={4} fill={theme.palette.background.paper} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {tiene ? promedio.toLocaleString('es-AR') : '—'}
          {tiene && (
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}
              / 5
            </Typography>
          )}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: tiene ? nivel.color : 'text.secondary' }}>
          {tiene ? nivel.nombre : 'Sin calificaciones'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {cantidad > 0 ? `${cantidad} calificaci${cantidad === 1 ? 'ón' : 'ones'}` : 'Todavía no te calificaron'}
        </Typography>
      </Box>
    </Stack>
  )
}
