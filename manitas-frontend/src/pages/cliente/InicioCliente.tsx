import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import IconoEspecialidad from '../../components/IconoEspecialidad'
import TarjetaProfesional from '../../components/profesional/TarjetaProfesional'
import PerfilProfesionalDialog from '../../components/profesional/PerfilProfesionalDialog'
import {
  categorias,
  profesionalesCercanos,
  promocionesDelMes,
  type ProfesionalResumen,
} from '../../mocks/inicioCliente'

const CATEGORIAS_VISIBLES = 6

// Título de cada sección, con un link o acciones a la derecha
function Seccion({ titulo, accion, children }: { titulo: string; accion?: ReactNode; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
        {accion}
      </Stack>
      {children}
    </Box>
  )
}

// Pantalla principal del cliente (con datos mock por ahora, ver src/mocks/inicioCliente.ts)
export default function InicioCliente() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [verTodasCategorias, setVerTodasCategorias] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState<ProfesionalResumen | null>(null)
  const carrusel = useRef<HTMLDivElement>(null)

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const texto = busqueda.trim()
    navigate(texto ? `/app/profesionales?q=${encodeURIComponent(texto)}` : '/app/profesionales')
  }

  const desplazar = (sentido: 1 | -1) => {
    const el = carrusel.current
    if (el) el.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const categoriasMostradas = verTodasCategorias ? categorias : categorias.slice(0, CATEGORIAS_VISIBLES)

  return (
    <>
      {/* Buscador */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          color: 'common.white',
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          ¿Qué necesitás arreglar hoy?
        </Typography>
        <Box component="form" onSubmit={buscar}>
          <TextField
            fullWidth
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej: pérdida de agua, enchufe que no anda, pintar un cuarto..."
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" aria-label="Buscar" edge="end" color="primary">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>

      {/* Categorías */}
      <Seccion titulo="Categorías">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 1.5 }}>
          {categoriasMostradas.map((c) => (
            <ButtonBase
              key={c.idEspecialidad}
              onClick={() => navigate(`/app/profesionales?especialidad=${c.idEspecialidad}`)}
              sx={{
                flexDirection: 'column',
                gap: 0.5,
                py: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                color: 'primary.main',
                transition: 'box-shadow .2s, border-color .2s',
                '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
              }}
            >
              <IconoEspecialidad nombre={c.nombre} fontSize="large" />
              <Typography variant="body2" color="text.primary">
                {c.nombre}
              </Typography>
            </ButtonBase>
          ))}
          {categorias.length > CATEGORIAS_VISIBLES && (
            <ButtonBase
              onClick={() => setVerTodasCategorias((v) => !v)}
              sx={{
                flexDirection: 'column',
                gap: 0.5,
                py: 2,
                borderRadius: 2,
                border: 1,
                borderStyle: 'dashed',
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            >
              {verTodasCategorias ? <RemoveIcon fontSize="large" /> : <AddIcon fontSize="large" />}
              <Typography variant="body2">{verTodasCategorias ? 'Menos' : 'Más'}</Typography>
            </ButtonBase>
          )}
        </Box>
      </Seccion>

      {/* Profesionales cerca tuyo: carrusel horizontal */}
      <Seccion
        titulo="Profesionales cerca tuyo"
        accion={
          <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <IconButton aria-label="Anteriores" onClick={() => desplazar(-1)}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton aria-label="Siguientes" onClick={() => desplazar(1)}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        }
      >
        <Box
          ref={carrusel}
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: { xs: '85%', sm: 'calc((100% - 16px) / 2)', md: 'calc((100% - 32px) / 3)' },
            gap: 2,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: 1,
            '& > *': { scrollSnapAlign: 'start' },
          }}
        >
          {profesionalesCercanos.map((p) => (
            <TarjetaProfesional key={p.idUsuario} profesional={p} onVerPerfil={() => setPerfilAbierto(p)} />
          ))}
        </Box>
        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Link component={RouterLink} to="/app/profesionales">
            Ver todos
          </Link>
        </Box>
      </Seccion>

      {/* Promociones bancarias */}
      <Seccion titulo="Promos bancarias del mes">
        <Grid container spacing={2}>
          {promocionesDelMes.map((promo) => (
            <Grid key={promo.idPromocion} size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: promo.color, width: 28, height: 28, fontSize: 14 }}>
                      {promo.banco.replace('Banco ', '')[0]}
                    </Avatar>
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
        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Link component={RouterLink} to="/app/promociones">
            Ver todas las promociones bancarias
          </Link>
        </Box>
      </Seccion>

      <PerfilProfesionalDialog profesional={perfilAbierto} onClose={() => setPerfilAbierto(null)} />
    </>
  )
}
