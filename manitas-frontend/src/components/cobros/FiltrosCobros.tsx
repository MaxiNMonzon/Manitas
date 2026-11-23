import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { estadosCobro, ORDEN_ESTADOS } from './estadosCobro'
import { cantidadDeFiltros, SIN_FILTROS, type Filtros } from './filtros'

interface Props {
  // El botón "Filtros" (el cartel se abre debajo); con null está cerrado
  ancla: HTMLElement | null
  onClose: () => void
  filtros: Filtros
  onChange: (filtros: Filtros) => void
  // Las especialidades que aparecen en sus cobros
  especialidades: string[]
}

// Cartel para filtrar la lista del mes por estado, concepto y especialidad (tocando las burbujas)
export default function FiltrosCobros({ ancla, onClose, filtros, onChange, especialidades }: Props) {
  // Agrega o saca un valor de un filtro
  const alternar = <K extends keyof Filtros>(clave: K, valor: Filtros[K][number]) => {
    const lista = filtros[clave] as Filtros[K][number][]
    onChange({ ...filtros, [clave]: lista.includes(valor) ? lista.filter((otro) => otro !== valor) : [...lista, valor] })
  }

  return (
    <Popover
      open={ancla !== null}
      anchorEl={ancla}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Stack spacing={2} sx={{ p: 2, maxWidth: 320 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Estado
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {ORDEN_ESTADOS.map((estado) => (
              <Chip
                key={estado}
                label={estadosCobro[estado].label}
                color={filtros.estados.includes(estado) ? estadosCobro[estado].color : 'default'}
                variant={filtros.estados.includes(estado) ? 'filled' : 'outlined'}
                onClick={() => alternar('estados', estado)}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Concepto
          </Typography>
          <Stack direction="row" spacing={1}>
            {(['trabajo', 'visita'] as const).map((tipo) => (
              <Chip
                key={tipo}
                label={tipo === 'trabajo' ? 'Trabajos' : 'Visitas'}
                color={filtros.conceptos.includes(tipo) ? 'primary' : 'default'}
                variant={filtros.conceptos.includes(tipo) ? 'filled' : 'outlined'}
                onClick={() => alternar('conceptos', tipo)}
              />
            ))}
          </Stack>
        </Box>
        {especialidades.length > 1 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Especialidad
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {especialidades.map((especialidad) => (
                <Chip
                  key={especialidad}
                  label={especialidad}
                  color={filtros.especialidades.includes(especialidad) ? 'primary' : 'default'}
                  variant={filtros.especialidades.includes(especialidad) ? 'filled' : 'outlined'}
                  onClick={() => alternar('especialidades', especialidad)}
                />
              ))}
            </Stack>
          </Box>
        )}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => onChange(SIN_FILTROS)} disabled={cantidadDeFiltros(filtros) === 0}>
            Limpiar
          </Button>
          <Button variant="contained" onClick={onClose}>
            Listo
          </Button>
        </Stack>
      </Stack>
    </Popover>
  )
}
