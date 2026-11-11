import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import AvatarPersona from '../AvatarPersona'

interface Props {
  nombre: string
  apellido: string
  tamañoAvatar: number
  // Lo que va debajo del nombre (el cliente: email y zona; el profesional: oficios y estrellas)
  children: ReactNode
  // Los botones de la derecha (ver BotonesEdicion)
  acciones: ReactNode
}

// Arriba de "Mi perfil": iniciales, nombre, datos cortos y el botón para editar
export default function EncabezadoPerfil({ nombre, apellido, tamañoAvatar, children, acciones }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
        <AvatarPersona nombre={nombre} apellido={apellido} tamaño={tamañoAvatar} />
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {nombre} {apellido}
          </Typography>
          {children}
        </Box>
        <Box sx={{ flexShrink: 0 }}>{acciones}</Box>
      </Stack>
    </Paper>
  )
}

// "Editar perfil", o "Cancelar" y "Guardar cambios" mientras se edita
export function BotonesEdicion({
  editando,
  guardando,
  onEditar,
  onCancelar,
  onGuardar,
}: {
  editando: boolean
  guardando: boolean
  onEditar: () => void
  onCancelar: () => void
  onGuardar: () => void
}) {
  if (!editando) {
    return (
      <Button variant="contained" startIcon={<EditIcon />} onClick={onEditar}>
        Editar perfil
      </Button>
    )
  }
  return (
    <Stack direction="row" spacing={1}>
      <Button onClick={onCancelar} disabled={guardando}>
        Cancelar
      </Button>
      <Button variant="contained" onClick={onGuardar} loading={guardando}>
        Guardar cambios
      </Button>
    </Stack>
  )
}
