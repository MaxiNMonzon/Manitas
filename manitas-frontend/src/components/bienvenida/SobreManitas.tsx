import type { ReactElement, ReactNode } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import StarIcon from '@mui/icons-material/Star'
import BoltIcon from '@mui/icons-material/Bolt'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PlaceIcon from '@mui/icons-material/Place'
import PaymentsIcon from '@mui/icons-material/Payments'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import HandshakeIcon from '@mui/icons-material/Handshake'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { botonFlotante, iconoQueRebota } from '../../estilos'

// Lo que se ve al bajar en la pantalla de bienvenida: qué es Manitas, y cómo funciona.
// Es para alguien que llega sin saber nada de la app.
// Los títulos y párrafos usan las variantes del tema (etiqueta, tituloSeccion, bajada): sus
// tamaños y colores se configuran en theme.ts

const pasosCliente = [
  {
    icono: <SearchIcon />,
    titulo: 'Contá qué necesitás',
    texto:
      'Escribí el problema con tus palabras ("pierde la canilla") o elegí el oficio. Te mostramos los profesionales que trabajan en tu zona.',
  },
  {
    icono: <EventAvailableIcon />,
    titulo: 'Elegí el turno de la visita',
    texto: 'Mirás su perfil, sus reseñas y su horario, y elegís el día y la hora que te queden cómodos.',
  },
  {
    icono: <RequestQuoteIcon />,
    titulo: 'Recibí el presupuesto',
    texto: 'El profesional va, revisa y te pasa el presupuesto por la app. Vos decidís si lo aceptás.',
  },
  {
    icono: <StarIcon />,
    titulo: 'Pagá y calificá',
    texto: 'Pagás con Mercado Pago desde la app y, cuando termina, lo calificás para ayudar a otros vecinos.',
  },
]

const ventajasProfesional = [
  {
    icono: <PlaceIcon />,
    texto: 'Elegís las zonas donde trabajás y te llegan pedidos de clientes cercanos.',
  },
  {
    icono: <CalendarMonthIcon />,
    texto: 'Cargás tu horario una vez y la agenda se arma sola, sin superponer turnos.',
  },
  {
    icono: <BoltIcon />,
    texto: 'Si querés, tomás urgencias de tu zona y le avisás al cliente en cuánto llegás.',
  },
  {
    icono: <PaymentsIcon />,
    texto: 'Cobrás por la app y ves cada pago y cuándo se deposita en tu cuenta.',
  },
]

const puntosQueEs = [
  {
    icono: <VerifiedUserIcon />,
    titulo: 'Profesionales con nombre y reseñas',
    texto: 'Cada uno tiene su perfil, sus matrículas y las calificaciones de trabajos anteriores.',
  },
  {
    icono: <HandshakeIcon />,
    titulo: 'Todo acordado por escrito',
    texto: 'El turno, el presupuesto y los cambios de horario quedan registrados en la solicitud.',
  },
  {
    icono: <BoltIcon />,
    titulo: 'Urgencias',
    texto: '¿Se cortó la luz o hay una pérdida? Pedís una urgencia y le llega a los profesionales cercanos.',
  },
]

// Medidas con nombre (los colores y los espaciados salen del tema)
const LADO_ICONO = 48
const ANCHO_TITULO = 680

// Los estilos de cada parte, separados del JSX
const estilos = {
  seccion: { py: { xs: 7, md: 10 }, scrollMarginTop: 0 },
  encabezado: { textAlign: 'center', mb: { xs: 4, md: 6 }, maxWidth: ANCHO_TITULO, mx: 'auto' },
  icono: { width: LADO_ICONO, height: LADO_ICONO },
  // Tarjeta con el ícono a la izquierda y el texto a la derecha
  tarjetaConIcono: { p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' },
  tarjetaPaso: { p: 3, height: '100%', position: 'relative' },
  // El número grande y apagado en la esquina de cada paso
  numeroPaso: { position: 'absolute', top: 12, right: 16, fontSize: 40, fontWeight: 800, color: 'action.hover', lineHeight: 1 },
  tituloPaso: { fontWeight: 700, mt: 2, mb: 1, fontSize: 18 },
  tarjetaVentaja: { p: 2.5, height: '100%' },
  contenedorVolver: { display: 'flex', justifyContent: 'center', pb: { xs: 5, md: 7 } },
} satisfies Record<string, SxProps<Theme>>

function Seccion({ id, fondo, children }: { id?: string; fondo?: string; children: ReactNode }) {
  return (
    <Box component="section" id={id} sx={[estilos.seccion, { bgcolor: fondo ?? 'background.default' }]}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  )
}

// La "etiqueta" chica arriba y el título grande de una sección
function Titulo({ chico, children }: { chico: string; children: ReactNode }) {
  return (
    <Box sx={estilos.encabezado}>
      <Typography variant="etiqueta">{chico}</Typography>
      <Typography variant="tituloSeccion">{children}</Typography>
    </Box>
  )
}

function Icono({ children, color = 'primary' }: { children: ReactElement; color?: 'primary' | 'secondary' }) {
  return <Avatar sx={[estilos.icono, { bgcolor: `${color}.main` }]}>{children}</Avatar>
}

export default function SobreManitas() {
  return (
    <>
      {/* Qué es */}
      <Seccion id="que-es">
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="etiqueta">¿Qué es Manitas?</Typography>
            <Typography variant="tituloSeccion" sx={{ mb: 2 }}>
              Arreglos del hogar, sin vueltas
            </Typography>
            <Typography variant="bajada" sx={{ mb: 2 }}>
              Se rompe algo en casa y empieza la búsqueda: pedir números, esperar que contesten, no saber cuánto va a salir. Manitas junta
              en un solo lugar a vecinos que necesitan un arreglo y a profesionales de oficio de su zona.
            </Typography>
            <Typography variant="bajada">
              Plomería, electricidad, gas, pintura, cerrajería y más: elegís a quién llamar viendo su perfil y lo que opinan otros clientes,
              coordinás la visita en un turno libre y pagás todo desde la app.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {puntosQueEs.map((v) => (
                <Paper key={v.titulo} variant="outlined" sx={estilos.tarjetaConIcono}>
                  <Icono color="secondary">{v.icono}</Icono>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{v.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {v.texto}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Seccion>

      {/* Cómo funciona: cliente */}
      <Seccion fondo="grey.50">
        <Titulo chico="Cómo funciona">Si necesitás un arreglo</Titulo>
        <Grid container spacing={3}>
          {pasosCliente.map((p, i) => (
            <Grid key={p.titulo} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper variant="outlined" sx={estilos.tarjetaPaso}>
                <Typography sx={estilos.numeroPaso}>{i + 1}</Typography>
                <Icono>{p.icono}</Icono>
                <Typography variant="h6" sx={estilos.tituloPaso}>
                  {p.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.texto}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Seccion>

      {/* Cómo funciona: profesional */}
      <Seccion>
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="etiqueta">Para profesionales</Typography>
            <Typography variant="tituloSeccion" sx={{ mb: 2 }}>
              Si trabajás de tu oficio
            </Typography>
            <Typography variant="bajada" sx={{ mb: 3 }}>
              Manitas te ayuda a conseguir clientes cerca tuyo y a ordenar el día a día: pedidos, visitas, presupuestos y cobros, todo en el
              mismo lugar. Vos ponés tus precios y tus horarios.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              {ventajasProfesional.map((v) => (
                <Grid key={v.texto} size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={estilos.tarjetaVentaja}>
                    <Icono color="secondary">{v.icono}</Icono>
                    <Typography sx={{ mt: 1.5 }}>{v.texto}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Seccion>

      {/* Volver arriba, a ingresar o registrarse */}
      <Box sx={estilos.contenedorVolver}>
        <ButtonBase
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
          sx={[botonFlotante, iconoQueRebota(-5)]}
        >
          <KeyboardArrowUpIcon />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Volver arriba
          </Typography>
        </ButtonBase>
      </Box>
    </>
  )
}
