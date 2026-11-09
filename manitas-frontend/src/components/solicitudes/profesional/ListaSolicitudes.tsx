import { useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TarjetaSolicitud from '../TarjetaSolicitud'
import GrupoCarpeta from '../GrupoCarpeta'
import { claveDe, enCarpetas, URGENTES } from './ordenSolicitudes'
import type { Grupo } from '../estados'
import type { SolicitudResumen } from '../../../types'

const POR_PAGINA = 5

interface Props {
  grupo: Grupo
  // Ya ordenada (ver ordenSolicitudes.ts)
  lista: SolicitudResumen[]
  cargando: boolean
  // Texto cuando la pestaña no tiene solicitudes
  vacio: string
  onVerDetalles: (s: SolicitudResumen) => void
  // El botón de la tarjeta (ej: "Enviar presupuesto"), si corresponde
  accionDe: (s: SolicitudResumen) => ReactNode
}

// La lista de una pestaña: las del mismo estado (o las urgentes) juntas en una carpeta de su color,
// de a 5 con un botón "Ver más". La página la monta con key={grupo}, así al cambiar de pestaña arranca de cero.
export default function ListaSolicitudes({ grupo, lista, cargando, vacio, onVerDetalles, accionDe }: Props) {
  // Carpetas cerradas por el usuario (al entrar están todas abiertas)
  const [cerradas, setCerradas] = useState<Set<string>>(new Set())
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)

  const alternar = (clave: string) =>
    setCerradas((c) => {
      const nuevas = new Set(c)
      if (nuevas.has(clave)) nuevas.delete(clave)
      else nuevas.add(clave)
      return nuevas
    })

  if (cargando) {
    return (
      <Stack spacing={1.5}>
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
        {enCarpetas(grupo, lista.slice(0, cantidadVisible)).map(({ clave, titulo, color, items }) => {
          const tarjetas = items.map((s) => (
            <TarjetaSolicitud
              key={s.idSolicitud}
              solicitud={s}
              onVerDetalles={() => onVerDetalles(s)}
              acciones={accionDe(s)}
              // El estado ya lo dice la carpeta (o la pestaña, en Nuevas); en la de urgentes se mezclan
              mostrarEstado={clave === URGENTES}
            />
          ))
          // En Nuevas hay un solo estado: no hace falta carpeta
          if (grupo === 'nuevas') return tarjetas
          return (
            <GrupoCarpeta
              key={clave}
              titulo={titulo}
              color={color}
              cantidad={lista.filter((s) => claveDe(grupo, s) === clave).length}
              abierto={!cerradas.has(clave)}
              onAlternar={() => alternar(clave)}
            >
              {tarjetas}
            </GrupoCarpeta>
          )
        })}
      </Stack>

      {lista.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((c) => c + POR_PAGINA)}>Ver más ({lista.length - cantidadVisible})</Button>
        </Box>
      )}
    </>
  )
}