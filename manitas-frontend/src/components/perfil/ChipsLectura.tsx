import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import type { Opcion } from '../SelectorConChips'

// Lista de burbujas cuando no se está editando (especialidades, habilidades, zonas)
export default function ChipsLectura({ label, items, vacio }: { label: string; items: Opcion[]; vacio: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5, p: 1, minHeight: 56, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 0.5 }}>
            {vacio}
          </Typography>
        ) : (
          items.map((i) => <Chip key={i.id} label={i.label} color="primary" variant="outlined" />)
        )}
      </Box>
    </Box>
  )
}