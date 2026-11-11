import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconoEspecialidad from '../IconoEspecialidad'
import Seccion from '../Seccion'
import type { Categoria } from '../../types'

const CATEGORIAS_VISIBLES = 6

// "Categorías" del Inicio del cliente: un botón por oficio (lleva a Profesionales filtrado por ese oficio).
// Se ven 6 y con "Más" aparecen todas
export default function CategoriasInicio({ categorias }: { categorias: Categoria[] }) {
  const navigate = useNavigate()
  const [verTodas, setVerTodas] = useState(false)
  const mostradas = verTodas ? categorias : categorias.slice(0, CATEGORIAS_VISIBLES)

  return (
    <Seccion titulo="Categorías">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 1.5 }}>
        {mostradas.map((c) => (
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
            onClick={() => setVerTodas((v) => !v)}
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
            {verTodas ? <RemoveIcon fontSize="large" /> : <AddIcon fontSize="large" />}
            <Typography variant="body2">{verTodas ? 'Menos' : 'Más'}</Typography>
          </ButtonBase>
        )}
      </Box>
    </Seccion>
  )
}
