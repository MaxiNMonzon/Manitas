import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, lighten, useTheme } from '@mui/material/styles'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ColorChip } from './estados'

interface Props {
  titulo: string
  color: ColorChip
  cantidad: number
  abierto: boolean
  onAlternar: () => void
  children: ReactNode
}

const RADIO = 12

// Grupo de solicitudes (de un mismo estado, o las urgentes) con forma de carpeta: la pestaña de
// arriba es el título (con su color) y al tocarla se abre o se cierra la lista
export default function GrupoCarpeta({ titulo, color, cantidad, abierto, onAlternar, children }: Props) {
  const theme = useTheme()
  const tono = color === 'default' ? theme.palette.grey[600] : theme.palette[color].main
  // Fondos sólidos (no transparentes) para que la pestaña tape el borde del cuerpo
  const fondoCuerpo = lighten(tono, 0.95)
  const fondoPestaña = abierto ? fondoCuerpo : lighten(tono, 0.88)

  return (
    <Box>
      <ButtonBase
        onClick={onAlternar}
        aria-expanded={abierto}
        sx={{
          gap: 1,
          px: 2,
          py: 1,
          color: tono,
          bgcolor: fondoPestaña,
          border: 1,
          borderColor: alpha(tono, 0.5),
          borderRadius: abierto ? `${RADIO}px ${RADIO}px 0 0` : `${RADIO}px`,
          // Abierta, la pestaña se "pega" al cuerpo de la carpeta (tapa su borde de arriba)
          borderBottomColor: abierto ? 'transparent' : alpha(tono, 0.5),
          position: 'relative',
          zIndex: 1,
          mb: abierto ? '-1px' : 0,
          transition: 'border-radius .2s',
          '&:hover': { bgcolor: lighten(tono, 0.82) },
        }}
      >
        {abierto ? <FolderOpenIcon /> : <FolderIcon />}
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {titulo}
        </Typography>
        <Box
          component="span"
          sx={{
            minWidth: 24,
            px: 0.75,
            borderRadius: 12,
            bgcolor: tono,
            color: 'common.white',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: '24px',
            textAlign: 'center',
          }}
        >
          {cantidad}
        </Box>
        <ExpandMoreIcon sx={{ transition: 'transform .2s', transform: abierto ? 'rotate(180deg)' : 'none' }} />
      </ButtonBase>

      <Collapse in={abierto}>
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            border: 1,
            borderColor: alpha(tono, 0.5),
            borderRadius: `0 ${RADIO}px ${RADIO}px ${RADIO}px`,
            bgcolor: fondoCuerpo,
          }}
        >
          <Stack spacing={1.5}>{children}</Stack>
        </Box>
      </Collapse>
    </Box>
  )
}