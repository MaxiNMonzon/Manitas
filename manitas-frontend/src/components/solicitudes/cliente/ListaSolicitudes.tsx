import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TarjetaSolicitudCliente from '../TarjetaSolicitudCliente'
import type { SolicitudResumen } from '../../../types'

const POR_PAGINA = 5

interface Props {
  // Ya ordenada (ver ordenSolicitudes.ts)
  lista: SolicitudResumen[]
  cargando: boolean
  // Texto cuando la pestaña no tiene solicitudes
  vacio: string
  // Dirección del cliente (donde son las visitas)
  direccion: string | null
  onVerDetalles: (solicitud: SolicitudResumen) => void
}

// La lista de una pestaña, de a 5 con un botón "Ver más".
// La página la monta con key={grupo}, así al cambiar de pestaña arranca de cero.
export default function ListaSolicitudes({ lista, cargando, vacio, direccion, onVerDetalles }: Props) {
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)

  if (cargando) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
      </Stack>
    )
  }

  if (lista.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{vacio}</Typography>
      </Paper>
    )
  }

  return (
    <>
      <Stack spacing={1.5}>
        {lista.slice(0, cantidadVisible).map((solicitud) => (
          <TarjetaSolicitudCliente key={solicitud.idSolicitud} solicitud={solicitud} direccion={direccion} onVerDetalles={() => onVerDetalles(solicitud)} />
        ))}
      </Stack>

      {lista.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((anterior) => anterior + POR_PAGINA)}>Ver más ({lista.length - cantidadVisible})</Button>
        </Box>
      )}
    </>
  )
}
