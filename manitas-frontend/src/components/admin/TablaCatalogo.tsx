import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Fila } from '../../api/catalogos'
import type { Catalogo } from '../../pages/admin/catalogos'

const POR_PAGINA = 50

interface Props {
  catalogo: Catalogo
  // Ya filtradas y buscadas
  filas: Fila[]
  // En celular se muestra una tarjeta por fila en vez de la tabla
  angosto: boolean
  onElegir: (fila: Fila) => void
}

// El listado de un catálogo: tabla en compu y tarjetas en celular, de a 50 con "Ver más".
// La página la monta con una key por filtro y búsqueda, así al cambiarlos arranca de cero
export default function TablaCatalogo({ catalogo, filas, angosto, onElegir }: Props) {
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)
  const visibles = filas.slice(0, cantidadVisible)

  return (
    <>
      {angosto ? (
        // Celular: una tarjeta por fila
        <Stack spacing={1}>
          {visibles.map((fila) => (
            <Paper key={String(fila[catalogo.id])} variant="outlined" sx={{ p: 1.5, cursor: 'pointer' }} onClick={() => onElegir(fila)}>
              <Typography sx={{ fontWeight: 600 }}>{catalogo.columnas[0].valor(fila)}</Typography>
              {catalogo.columnas.slice(1).map((columna) => (
                <Typography key={columna.label} variant="body2" color="text.secondary">
                  {columna.label}: {columna.valor(fila)}
                </Typography>
              ))}
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {catalogo.columnas.map((columna) => (
                  <TableCell key={columna.label} sx={{ fontWeight: 700 }}>
                    {columna.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.map((fila) => (
                <TableRow key={String(fila[catalogo.id])} hover sx={{ cursor: 'pointer' }} onClick={() => onElegir(fila)}>
                  {catalogo.columnas.map((columna) => (
                    <TableCell key={columna.label} sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap>
                        {columna.valor(fila)}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filas.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((anterior) => anterior + POR_PAGINA)}>Ver más ({filas.length - cantidadVisible})</Button>
        </Box>
      )}
    </>
  )
}