import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

interface Props<T> {
  label: string
  opciones: T[]
  seleccionados: T[]
  onChange: (seleccionados: T[]) => void
  // Cómo leer cada elemento: así se usan los datos tal como vienen del back, sin convertirlos
  idDe: (item: T) => number
  textoDe: (item: T) => string
  // Para agrupar las opciones en la lista (ej: habilidades por especialidad)
  grupoDe?: (item: T) => string | undefined
  disabled?: boolean
  // Texto de ayuda debajo (o el error, si hay)
  ayuda?: string
  error?: string
  required?: boolean
}

// Lista desplegable con búsqueda: cada opción elegida se agrega abajo como una "burbuja"
// con una X para sacarla. Es genérico (<T>): sirve para especialidades, habilidades o zonas
export default function SelectorConChips<T>({
  label,
  opciones,
  seleccionados,
  onChange,
  idDe,
  textoDe,
  grupoDe,
  disabled,
  ayuda,
  error,
  required,
}: Props<T>) {
  const [texto, setTexto] = useState('')
  const idsElegidos = new Set(seleccionados.map(idDe))
  const disponibles = opciones.filter((o) => !idsElegidos.has(idDe(o)))

  return (
    <Box>
      <Autocomplete
        options={disponibles}
        groupBy={grupoDe ? (o) => grupoDe(o) ?? '' : undefined}
        getOptionLabel={textoDe}
        isOptionEqualToValue={(a, b) => idDe(a) === idDe(b)}
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
              key={idDe(s)}
              label={textoDe(s)}
              color="primary"
              variant="outlined"
              onDelete={() => onChange(seleccionados.filter((x) => idDe(x) !== idDe(s)))}
            />
          ))
        )}
      </Box>
      {(error || ayuda) && <FormHelperText error={Boolean(error)}>{error ?? ayuda}</FormHelperText>}
    </Box>
  )
}
