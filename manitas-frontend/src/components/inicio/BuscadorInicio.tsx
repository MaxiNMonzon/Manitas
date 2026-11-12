import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import BoltIcon from '@mui/icons-material/Bolt'
import SearchIcon from '@mui/icons-material/Search'

// Arriba del Inicio del cliente: "¿Qué necesitás arreglar hoy?" con el buscador y el botón de urgencia.
// Al buscar va a Profesionales con lo que escribió (?q=...), y ahí filtra el back
export default function BuscadorInicio({ onUrgente }: { onUrgente: () => void }) {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const texto = busqueda.trim()
    navigate(texto ? `/app/profesionales?q=${encodeURIComponent(texto)}` : '/app/profesionales')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
        color: 'common.white',
        background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ¿Qué necesitás arreglar hoy?
        </Typography>
        <Button variant="contained" color="error" startIcon={<BoltIcon />} onClick={onUrgente}>
          Es urgente
        </Button>
      </Stack>
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
  )
}