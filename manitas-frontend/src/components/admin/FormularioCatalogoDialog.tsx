import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { crear, editar, type Fila } from '../../api/catalogos'
import CampoReferencia from './CampoReferencia'
import { cuerpoParaEnviar, errores as erroresDe, valoresIniciales } from './formularioCatalogo'
import type { Catalogo } from '../../pages/admin/catalogos'

interface Props {
  catalogo: Catalogo
  // null = alta
  fila: Fila | null
  onClose: () => void
  onGuardado: (mensaje: string) => void
}

// Alta o edición: arma el formulario con los campos del catálogo.
// La página lo monta con una key nueva cada vez que se abre, así arranca de cero
export default function FormularioCatalogoDialog({ catalogo, fila, onClose, onGuardado }: Props) {
  const [valores, setValores] = useState<Fila>(() => valoresIniciales(catalogo, fila))
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const errores = erroresDe(catalogo, valores)

  const guardar = async () => {
    setIntento(true)
    if (Object.keys(errores).length > 0) return
    const cuerpo = cuerpoParaEnviar(catalogo, valores, fila !== null)
    setGuardando(true)
    setError(null)
    try {
      if (fila) await editar(catalogo.path, Number(fila[catalogo.id]), cuerpo)
      else await crear(catalogo.path, cuerpo)
      onGuardado(fila ? 'Cambios guardados.' : 'Alta guardada.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{fila ? `Editar ${catalogo.singular}` : `Agregar ${catalogo.singular}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {catalogo.campos.map((c) => {
            const err = intento ? errores[c.clave] : undefined
            const cambiar = (v: unknown) => setValores((actual) => ({ ...actual, [c.clave]: v }))
            if (c.tipo === 'referencia' || c.tipo === 'referencias') {
              return <CampoReferencia key={c.clave} campo={c} valor={valores[c.clave]} onChange={cambiar} error={err} />
            }
            return (
              <TextField
                key={c.clave}
                select={c.tipo === 'opciones'}
                label={c.label}
                required={c.requerido}
                type={c.tipo === 'numero' ? 'number' : c.tipo === 'fecha' ? 'date' : 'text'}
                multiline={c.tipo === 'textoLargo'}
                minRows={c.tipo === 'textoLargo' ? 2 : undefined}
                value={valores[c.clave] ?? ''}
                onChange={(e) => cambiar(e.target.value)}
                error={Boolean(err)}
                helperText={err ?? c.ayuda}
                slotProps={c.tipo === 'fecha' ? { inputLabel: { shrink: true } } : undefined}
              >
                {(c.opciones ?? []).map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            )
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar} loading={guardando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
