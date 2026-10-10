import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ConstructionIcon from '@mui/icons-material/Construction'

// Pantalla provisoria para las secciones que todavía no se desarrollaron
export default function EnConstruccion({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <ConstructionIcon color="disabled" sx={{ fontSize: 56, mb: 1 }} />
      <Typography variant="h5" gutterBottom>
        {titulo}
      </Typography>
      <Typography color="text.secondary">{descripcion ?? 'Esta sección está en construcción.'}</Typography>
    </Paper>
  )
}
