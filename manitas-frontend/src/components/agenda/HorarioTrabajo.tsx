import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { guardarMiHorario, traerMiHorario } from '../../api/horario'
import { useCarga } from '../../hooks/useCarga'
import type { RangoHorario } from '../../types'

// De lunes a domingo (el back usa 0 = domingo, como getDay() de JavaScript)
const DIAS = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
]
const HORAS = Array.from({ length: 25 }, (_, horaDelDia) => horaDelDia)
const hora = (horaDelDia: number) => `${String(horaDelDia).padStart(2, '0')}:00`
const RANGO_NUEVO = { horaDesde: 9, horaHasta: 18 }

// Algo mal cargado: la hora de fin antes de la de inicio, o dos rangos del mismo día que se pisan
function errorDe(rangos: RangoHorario[]): string | null {
  for (const { dia, nombre } of DIAS) {
    const delDia = rangos.filter((rango) => rango.diaSemana === dia).sort((primero, segundo) => primero.horaDesde - segundo.horaDesde)
    if (delDia.some((rango) => rango.horaDesde >= rango.horaHasta)) return `El ${nombre.toLowerCase()} la hora de inicio tiene que ser antes que la de fin`
    if (delDia.some((rango, indice) => indice > 0 && rango.horaDesde < delDia[indice - 1].horaHasta)) return `El ${nombre.toLowerCase()} hay horarios que se pisan`
  }
  return null
}

// Editor del horario fijo del profesional (GET / PUT /turnos/mi-horario). Con esto el back arma sus
// turnos de una hora, que son los que los clientes eligen al pedirle presupuesto
export default function HorarioTrabajo() {
  const guardado = useCarga('mi-horario', traerMiHorario)
  // null = sin cambios (se muestra lo guardado)
  const [editado, setEditado] = useState<RangoHorario[] | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const rangos = editado ?? guardado.datos ?? []
  const error = errorDe(rangos)
  const cambiar = (nuevos: RangoHorario[]) => {
    setEditado(nuevos)
    setResultado(null)
  }

  const guardar = async () => {
    setEnviando(true)
    try {
      await guardarMiHorario(rangos)
      setEditado(null)
      guardado.recargar()
      setResultado({ tipo: 'success', texto: 'Horario guardado. Los clientes ya ven tus turnos libres.' })
    } catch (fallo) {
      setResultado({ tipo: 'error', texto: fallo instanceof Error ? fallo.message : 'No se pudo guardar el horario' })
    } finally {
      setEnviando(false)
    }
  }

  if (guardado.cargando) return <Skeleton variant="rounded" height={280} />

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Los días y horas en que trabajás. Los clientes eligen la visita entre estos turnos (de una hora) que tengas
        libres. Lo que ya está reservado no cambia.
      </Typography>
      {guardado.error && <Alert severity="error">{guardado.error}</Alert>}
      {rangos.length === 0 && !guardado.error && (
        <Alert severity="warning">Todavía no cargaste tu horario: nadie te puede pedir una visita.</Alert>
      )}

      {DIAS.map(({ dia, nombre }) => {
        const delDia = rangos.filter((rango) => rango.diaSemana === dia)
        const otros = rangos.filter((rango) => rango.diaSemana !== dia)
        const trabaja = delDia.length > 0
        const actualizar = (indice: number, cambios: Partial<RangoHorario>) =>
          cambiar([...otros, ...delDia.map((rango, posicion) => (posicion === indice ? { ...rango, ...cambios } : rango))])

        return (
          <Stack key={dia} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
            <Stack direction="row" sx={{ alignItems: 'center', minWidth: 150 }}>
              <Switch
                checked={trabaja}
                onChange={(evento) => cambiar(evento.target.checked ? [...otros, { diaSemana: dia, ...RANGO_NUEVO }] : otros)}
                slotProps={{ input: { 'aria-label': nombre } }}
              />
              <Typography sx={{ fontWeight: trabaja ? 600 : 400, color: trabaja ? 'text.primary' : 'text.secondary' }}>
                {nombre}
              </Typography>
            </Stack>
            {trabaja ? (
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                {delDia.map((rango, indice) => (
                  <Stack key={indice} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField select size="small" label="Desde" value={rango.horaDesde} onChange={(evento) => actualizar(indice, { horaDesde: Number(evento.target.value) })} sx={{ width: 110 }}>
                      {HORAS.slice(0, 24).map((horaDelDia) => (
                        <MenuItem key={horaDelDia} value={horaDelDia}>
                          {hora(horaDelDia)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField select size="small" label="Hasta" value={rango.horaHasta} onChange={(evento) => actualizar(indice, { horaHasta: Number(evento.target.value) })} sx={{ width: 110 }}>
                      {HORAS.slice(1).map((horaDelDia) => (
                        <MenuItem key={horaDelDia} value={horaDelDia}>
                          {hora(horaDelDia)}
                        </MenuItem>
                      ))}
                    </TextField>
                    {delDia.length > 1 && (
                      <IconButton aria-label="Quitar horario" onClick={() => cambiar([...otros, ...delDia.filter((_, posicion) => posicion !== indice)])}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                    {indice === delDia.length - 1 && (
                      <IconButton
                        aria-label="Agregar otro horario ese día (ej: a la tarde)"
                        onClick={() => cambiar([...rangos, { diaSemana: dia, horaDesde: Math.min(rango.horaHasta + 1, 23), horaHasta: Math.min(rango.horaHasta + 4, 24) }])}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pt: { sm: 1 } }}>
                No trabajo
              </Typography>
            )}
          </Stack>
        )
      })}

      {error && <Alert severity="error">{error}</Alert>}
      {resultado && <Alert severity={resultado.tipo}>{resultado.texto}</Alert>}
      <Box sx={{ textAlign: 'right' }}>
        {editado && (
          <Button onClick={() => setEditado(null)} sx={{ mr: 1 }}>
            Descartar
          </Button>
        )}
        <Button variant="contained" onClick={guardar} disabled={!editado || !!error} loading={enviando}>
          Guardar horario
        </Button>
      </Box>
    </Stack>
  )
}
