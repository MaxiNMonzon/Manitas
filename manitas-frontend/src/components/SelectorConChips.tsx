import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export interface Opcion {
  id: number
  label: string
  // Para agrupar las opciones en la lista (ej: habilidades por especialidad)
  grupo?: string
  grupoId?: number
}

interface Props {
  label: string
  opciones: Opcion[]
  seleccionados: Opcion[]
  onChange: (seleccionados: Opcion[]) => void
  disabled?: boolean
  // Texto de ayuda debajo (o el error, si hay)
  ayuda?: string
  error?: string
  required?: boolean
}

// Lista desplegable con búsqueda: cada opción elegida se agrega abajo como una "burbuja"
// con una X para sacarla. Lo elegido se devuelve como array (ej: para idsEspecialidades).
export default function SelectorConChips({ label, opciones, seleccionados, onChange, disabled, ayuda, error, required }: Props) {
  const [texto, setTexto] = useState('')
  const idsElegidos = new Set(seleccionados.map((s) => s.id))
  const disponibles = opciones.filter((o) => !idsElegidos.has(o.id))

  return (
    <Box>
      <Autocomplete
        options={disponibles}
        groupBy={opciones.some((o) => o.grupo) ? (o) => o.grupo ?? '' : undefined}
        getOptionLabel={(o) => o.label}
        value={null}
        inputValue={texto}
        onInputChange={(_, valor, motivo) => setTexto(motivo === 'reset' ? '' : valor)}
        onChange={(_, opcion) => opcion && onChange([...seleccionados, opcion])}
        disabled={disabled}
        noOptionsText="No hay opciones"
        blurOnSelect
        renderInput={(params) => <TextField {...params} label={label} required={required} error={Boolean(error)} />}
      />
      <Box
        sx={{
          mt: 1,
          p: 1,
          minHeight: 56,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: 1,
          border: 1,
          borderStyle: 'dashed',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
        }}
      >
        {seleccionados.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ alignSelf: 'center', px: 1 }}>
            Ninguna elegida
          </Typography>
        ) : (
          seleccionados.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              color="primary"
              variant="outlined"
              onDelete={() => onChange(seleccionados.filter((x) => x.id !== s.id))}
            />
          ))
        )}
      </Box>
      {(error || ayuda) && <FormHelperText error={Boolean(error)}>{error ?? ayuda}</FormHelperText>}
    </Box>
  )
}
