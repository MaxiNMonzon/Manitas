import TextField from '@mui/material/TextField'
import LockIcon from '@mui/icons-material/Lock'

// Un dato que no se puede cambiar (DNI y fecha de nacimiento): gris y con candado
export default function CampoFijo({ label, valor, ayuda }: { label: string; valor: string; ayuda?: string }) {
  return (
    <TextField
      label={label}
      value={valor}
      fullWidth
      helperText={ayuda}
      slotProps={{ input: { readOnly: true, endAdornment: <LockIcon fontSize="small" color="disabled" /> } }}
      sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
    />
  )
}
