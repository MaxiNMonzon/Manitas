import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import HandymanIcon from '@mui/icons-material/Handyman'

// Logo + nombre + slogan de Manitas
export default function Marca({ color = 'primary.main' }: { color?: string }) {
  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center', color }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <HandymanIcon fontSize="large" />
        <Typography variant="h4" component="span" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          Manitas
        </Typography>
      </Stack>
      <Typography variant="subtitle1" sx={{ fontStyle: 'italic', opacity: 0.85 }}>
        Tu hogar en buenas manos
      </Typography>
    </Stack>
  )
}
