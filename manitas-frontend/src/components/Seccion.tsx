import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface Props {
  titulo: string
  // Link o acciones que van a la derecha del título
  accion?: ReactNode
  children: ReactNode
}

// Sección de una pantalla: título con un link o acciones a la derecha, y el contenido abajo
export default function Seccion({ titulo, accion, children }: Props) {
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