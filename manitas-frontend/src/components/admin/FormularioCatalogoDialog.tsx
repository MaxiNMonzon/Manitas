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
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar')
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
          {catalogo.campos.map((campo) => {
            const mensajeError = intento ? errores[campo.clave] : undefined
            const cambiar = (valor: unknown) => setValores((actual) => ({ ...actual, [campo.clave]: valor }))
            if (campo.tipo === 'referencia' || campo.tipo === 'referencias') {
              return <CampoReferencia key={campo.clave} campo={campo} valor={valores[campo.clave]} onChange={cambiar} error={mensajeError} />
            }
            return (
              <TextField
                key={campo.clave}
                select={campo.tipo === 'opciones'}
                label={campo.label}
                required={campo.requerido}
                type={campo.tipo === 'numero' ? 'number' : campo.tipo === 'fecha' ? 'date' : 'text'}
                multiline={campo.tipo === 'textoLargo'}
                minRows={campo.tipo === 'textoLargo' ? 2 : undefined}
                value={valores[campo.clave] ?? ''}
                onChange={(evento) => cambiar(evento.target.value)}
                error={Boolean(mensajeError)}
                helperText={mensajeError ?? campo.ayuda}
                slotProps={campo.tipo === 'fecha' ? { inputLabel: { shrink: true } } : undefined}
              >
                {(campo.opciones ?? []).map((opcion) => (
                  <MenuItem key={opcion} value={opcion}>
                    {opcion}
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