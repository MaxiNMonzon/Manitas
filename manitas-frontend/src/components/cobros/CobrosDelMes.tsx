import { useState } from 'react'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FilterListIcon from '@mui/icons-material/FilterList'
import dayjs, { type Dayjs } from 'dayjs'
import TarjetaCobro from './TarjetaCobro'
import FiltrosCobros from './FiltrosCobros'
import { estadosCobro, formatoPesos, ORDEN_ESTADOS } from './estadosCobro'
import { cantidadDeFiltros, capitalizar, cobrosDelMes, pagados, pasaFiltros, SIN_FILTROS, total, type Filtros } from './calculos'
import type { Cobro } from '../../types'

const POR_PAGINA = 5

interface Props {
  todos: Cobro[]
  // El mes que se está viendo (primer día)
  mes: Dayjs
  hoy: Dayjs
  onCambiarMes: (mes: Dayjs) => void
  // Últimos números del CBU/CVU (para el detalle del depósito)
  cuentaDeposito: string | null
  onVerComprobante: (c: Cobro) => void
}

// Barra apilada: cuánto del mes está cobrado y cuánto pendiente, con su referencia abajo
function BarraEstados({ cobros }: { cobros: Cobro[] }) {
  const partes = ORDEN_ESTADOS.map((estado) => ({ estado, monto: total(cobros.filter((c) => c.estado === estado)) }))
  const suma = partes.reduce((s, p) => s + p.monto, 0)
  return (
    <>
      <Box sx={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', bgcolor: 'action.hover', my: 1.5 }}>
        {suma > 0 &&
          partes.map(
            (p) =>
              p.monto > 0 && (
                <Tooltip key={p.estado} title={`${estadosCobro[p.estado].label}: ${formatoPesos(p.monto)}`} arrow>
                  <Box sx={{ width: `${(p.monto / suma) * 100}%`, bgcolor: `${estadosCobro[p.estado].color}.main`, transition: 'width .4s' }} />
                </Tooltip>
              ),
          )}
      </Box>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {partes.map((p) => (
          <Stack key={p.estado} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${estadosCobro[p.estado].color}.main` }} />
            <Typography variant="caption" color="text.secondary">
              {estadosCobro[p.estado].label}: <strong>{formatoPesos(p.monto)}</strong>
            </Typography>
          </Stack>
        ))}
      </Stack>
    </>
  )
}

// Pestaña "Cobros": se elige el mes con las flechas, se ve el total acumulado y la lista (con filtros).
// Los filtros quedan al cambiar de mes; lo que se mostró con "Ver más" vuelve a 5
export default function CobrosDelMes({ todos, mes, hoy, onCambiarMes, cuentaDeposito, onVerComprobante }: Props) {
  // Cuántos se ven, recordando de qué mes era (al cambiar de mes vuelve a 5)
  const [pagina, setPagina] = useState({ mes: mes.format('YYYY-MM'), cantidad: POR_PAGINA })
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [anclaFiltros, setAnclaFiltros] = useState<HTMLElement | null>(null)

  const delMes = cobrosDelMes(todos, mes, hoy)
  const filtrados = delMes.filter((c) => pasaFiltros(c, filtros))
  const especialidades = [...new Set(todos.map((c) => c.especialidad).filter((e): e is string => !!e))].sort()
  // No se puede ir más atrás que el primer cobro, ni más adelante que este mes
  const primerMes = todos.length ? dayjs(todos.map((c) => c.fechaPago ?? hoy.toISOString()).sort()[0]).startOf('month') : hoy.startOf('month')
  const esMesActual = mes.format('YYYY-MM') === hoy.format('YYYY-MM')
  const cantidadVisible = pagina.mes === mes.format('YYYY-MM') ? pagina.cantidad : POR_PAGINA

  return (
    <>
      {/* Mes: total acumulado y en qué estado está la plata */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <IconButton aria-label="Mes anterior" onClick={() => onCambiarMes(mes.subtract(1, 'month'))} disabled={!mes.isAfter(primerMes)}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
            {capitalizar(mes.format('MMMM YYYY'))}
          </Typography>
          <IconButton aria-label="Mes siguiente" onClick={() => onCambiarMes(mes.add(1, 'month'))} disabled={esMesActual}>
            <ChevronRightIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Badge badgeContent={cantidadDeFiltros(filtros)} color="primary">
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnclaFiltros(e.currentTarget)}>
              Filtros
            </Button>
          </Badge>
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {formatoPesos(total(pagados(delMes)))}{' '}
          <Typography component="span" variant="h6" color="text.secondary">
            acumulado
          </Typography>
        </Typography>

        <BarraEstados cobros={delMes} />
      </Paper>

      {filtrados.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {delMes.length === 0 ? `No tenés cobros en ${mes.format('MMMM')}.` : 'Ningún cobro coincide con los filtros.'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {filtrados.slice(0, cantidadVisible).map((c) => (
            <TarjetaCobro key={c.idSolicitud} cobro={c} cuentaDeposito={cuentaDeposito} onVerComprobante={() => onVerComprobante(c)} />
          ))}
        </Stack>
      )}

      {filtrados.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setPagina({ mes: mes.format('YYYY-MM'), cantidad: cantidadVisible + POR_PAGINA })}>Ver más ({filtrados.length - cantidadVisible})</Button>
        </Box>
      )}

      <FiltrosCobros ancla={anclaFiltros} onClose={() => setAnclaFiltros(null)} filtros={filtros} onChange={setFiltros} especialidades={especialidades} />
    </>
  )
}
