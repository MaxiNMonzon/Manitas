import { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Seccion from '../Seccion'
import TarjetaProfesional from '../profesional/TarjetaProfesional'
import type { ProfesionalResumen } from '../../types'

interface Props {
  profesionales: ProfesionalResumen[]
  cargando: boolean
  onVerPerfil: (profesional: ProfesionalResumen) => void
}

// "Profesionales cerca tuyo": carrusel horizontal con flechas (en celular se desliza con el dedo)
export default function ProfesionalesCercanos({ profesionales, cargando, onVerPerfil }: Props) {
  const carrusel = useRef<HTMLDivElement>(null)

  // Corre el carrusel casi una pantalla para un lado
  const desplazar = (sentido: 1 | -1) => {
    const elemento = carrusel.current
    if (elemento) elemento.scrollBy({ left: sentido * elemento.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
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
        {cargando && [0, 1, 2].map((indice) => <Skeleton key={indice} variant="rounded" height={170} />)}
        {!cargando && profesionales.length === 0 && <Typography color="text.secondary">Todavía no hay profesionales cargados.</Typography>}
        {profesionales.map((profesional) => (
          <TarjetaProfesional key={profesional.idUsuario} profesional={profesional} onVerPerfil={() => onVerPerfil(profesional)} />
        ))}
      </Box>
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Link component={RouterLink} to="/app/profesionales">
          Ver todos
        </Link>
      </Box>
    </Seccion>
  )
}