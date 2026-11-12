import type { ReactElement, ReactNode } from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface Props {
  icono: ReactElement
  titulo: string
  valor?: string
  detalle?: string
  // Contenido propio en vez de valor + detalle (ej: el medidor de la calificación)
  children?: ReactNode
  color: 'primary' | 'secondary' | 'warning'
  onClick: () => void
}

// Recuadro informativo del resumen del inicio del profesional (los de arriba del boceto)
export default function TarjetaDato({ icono, titulo, valor, detalle, children, color, onClick }: Props) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
        textAlign: 'left',
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': { boxShadow: 2, borderColor: `${color}.main` },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: `${color}.main`, mb: 1 }}>
        {icono}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
      </Stack>
      {children ?? (
        <>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {valor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detalle}
          </Typography>
        </>
      )}
    </ButtonBase>
  )
}