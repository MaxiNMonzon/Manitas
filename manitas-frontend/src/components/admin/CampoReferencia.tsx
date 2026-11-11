import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useOpciones, type Opcion } from './useOpciones'
import type { Campo } from '../../pages/admin/catalogos'

interface Props {
  campo: Campo
  valor: unknown
  onChange: (v: unknown) => void
  error?: string
}

// Elegir una (o varias) filas de otro catálogo, con búsqueda (ej: la localidad de una zona)
export default function CampoReferencia({ campo, valor, onChange, error }: Props) {
  const { opciones, cargando } = useOpciones(campo.referencia)
  const etiqueta = `${campo.label}${campo.requerido ? ' *' : ''}`

  if (campo.tipo === 'referencias') {
    const ids = Array.isArray(valor) ? (valor as number[]) : []
    return (
      <Autocomplete<Opcion, true>
        multiple
        loading={cargando}
        options={opciones}
        value={opciones.filter((o) => ids.includes(o.id))}
        onChange={(_, elegidas) => onChange(elegidas.map((o) => o.id))}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderInput={(p) => <TextField {...p} label={etiqueta} error={Boolean(error)} helperText={error ?? campo.ayuda} />}
      />
    )
  }
  return (
    <Autocomplete<Opcion>
      loading={cargando}
      options={opciones}
      value={opciones.find((o) => o.id === Number(valor)) ?? null}
      onChange={(_, elegida) => onChange(elegida?.id ?? null)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(p) => <TextField {...p} label={etiqueta} error={Boolean(error)} helperText={error ?? campo.ayuda} />}
    />
  )
}