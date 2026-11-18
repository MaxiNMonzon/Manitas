import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import type { Opcion } from '../SelectorConChips'
import { MAX_DESCRIPCION_MATRICULA, MAX_NUMERO_MATRICULA, nuevaMatricula, type MatriculaForm } from './matriculas'

interface Props {
  // Las especialidades elegidas: cada matrícula es de una de ellas
  especialidades: Opcion[]
  matriculas: MatriculaForm[]
  onChange: (matriculas: MatriculaForm[]) => void
  // Solo se muestran después de intentar guardar
  errores?: Record<number, string>
}

// Lista editable de matrículas: especialidad + número + descripción opcional, con "Agregar matrícula"
export default function EditorMatriculas({ especialidades, matriculas, onChange, errores = {} }: Props) {
  const cambiar = (clave: number, cambios: Partial<MatriculaForm>) =>
    onChange(matriculas.map((m) => (m.clave === clave ? { ...m, ...cambios } : m)))
  const sinEspecialidades = especialidades.length === 0

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Matrículas
      </Typography>
      <Stack spacing={1.5}>
        {matriculas.map((m) => (
          <Paper key={m.clave} variant="outlined" sx={{ p: 1.5 }}>
            <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Especialidad"
                  value={m.idEspecialidad}
                  onChange={(e) => cambiar(m.clave, { idEspecialidad: e.target.value })}
                  error={errores[m.clave] === 'Elegí la especialidad'}
                >
                  {especialidades.map((e) => (
                    <MenuItem key={e.id} value={String(e.id)}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={m.numero}
                  onChange={(e) => cambiar(m.clave, { numero: e.target.value.slice(0, MAX_NUMERO_MATRICULA) })}
                  error={Boolean(errores[m.clave]) && errores[m.clave] !== 'Elegí la especialidad'}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción (opcional)"
                  placeholder="Ej: Gasista de 1ª categoría"
                  value={m.descripcion}
                  onChange={(e) => cambiar(m.clave, { descripcion: e.target.value.slice(0, MAX_DESCRIPCION_MATRICULA) })}
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'right' }}>
                <Tooltip title="Sacar matrícula">
                  <IconButton aria-label="Sacar matrícula" onClick={() => onChange(matriculas.filter((x) => x.clave !== m.clave))}>
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            {errores[m.clave] && <FormHelperText error>{errores[m.clave]}</FormHelperText>}
          </Paper>
        ))}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        onClick={() => onChange([...matriculas, nuevaMatricula(matriculas, especialidades.length === 1 ? especialidades[0].id : undefined)])}
        disabled={sinEspecialidades}
        sx={{ mt: 1 }}
      >
        Agregar matrícula
      </Button>
      <FormHelperText>
        {sinEspecialidades ? 'Primero elegí una especialidad' : 'Opcional. Podés cargar una o más por especialidad'}
      </FormHelperText>
    </Box>
  )
}

// Las matrículas cuando no se está editando
export function ListaMatriculas({ matriculas }: { matriculas: { numero: string; descripcion?: string | null; especialidad: string }[] }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        Matrículas
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5, p: 1, minHeight: 56, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {matriculas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 0.5 }}>
            Sin matrículas cargadas
          </Typography>
        ) : (
          matriculas.map((m) => (
            <Stack key={`${m.especialidad}-${m.numero}`} direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <WorkspacePremiumIcon fontSize="small" color="primary" />
              <Chip size="small" color="primary" variant="outlined" label={m.especialidad} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {m.numero}
              </Typography>
              {m.descripcion && (
                <Typography variant="body2" color="text.secondary">
                  · {m.descripcion}
                </Typography>
              )}
            </Stack>
          ))
        )}
      </Stack>
    </Box>
  )
}
