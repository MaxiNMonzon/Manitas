import { useState, type ReactElement, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PaymentsIcon from '@mui/icons-material/Payments'
import CalculateIcon from '@mui/icons-material/Calculate'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import dayjs, { type Dayjs } from 'dayjs'
import { traerCobros } from '../../api/cobros'
import { useCarga } from '../../hooks/useCarga'
import SeccionTarjeta from '../../components/SeccionTarjeta'
import TarjetaCobro from '../../components/cobros/TarjetaCobro'
import ComprobanteDialog from '../../components/cobros/ComprobanteDialog'
import { estadosCobro, formatoPesos, mesDe, ORDEN_ESTADOS, pesosCorto } from '../../components/cobros/estadosCobro'
import type { Cobro, EstadoCobro } from '../../types'

const POR_PAGINA = 5
const MESES_HISTORIAL = 6

type Vista = 'cobros' | 'historial'

// Vacío = sin filtrar por eso
interface Filtros {
  estados: EstadoCobro[]
  conceptos: Cobro['concepto'][]
  especialidades: string[]
}
const SIN_FILTROS: Filtros = { estados: [], conceptos: [], especialidades: [] }

const pagados = (lista: Cobro[]) => lista.filter((c) => c.fechaPago != null)
const total = (lista: Cobro[]) => lista.reduce((suma, c) => suma + c.monto, 0)
const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

function pasaFiltros(c: Cobro, f: Filtros): boolean {
  return (
    (f.estados.length === 0 || f.estados.includes(c.estado)) &&
    (f.conceptos.length === 0 || f.conceptos.includes(c.concepto)) &&
    (f.especialidades.length === 0 || f.especialidades.includes(c.especialidad ?? ''))
  )
}

// Suma los montos por una clave (ej: especialidad) para las tortas, de mayor a menor
function agrupar(lista: Cobro[], clave: (c: Cobro) => string) {
  const sumas = new Map<string, number>()
  for (const c of lista) sumas.set(clave(c), (sumas.get(clave(c)) ?? 0) + c.monto)
  return [...sumas.entries()].map(([nombre, monto]) => ({ nombre, monto })).sort((a, b) => b.monto - a.monto)
}

function Metrica({ icono, titulo, valor, detalle, color }: { icono: ReactElement; titulo: string; valor: string; detalle: ReactNode; color: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color, mb: 1 }}>
        {icono}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {valor}
      </Typography>
      <Box sx={{ typography: 'caption', color: 'text.secondary' }}>{detalle}</Box>
    </Paper>
  )
}

// Torta (dona) con su referencia al lado: nombre, monto y porcentaje
function Torta({ datos, colores }: { datos: { nombre: string; monto: number }[]; colores: string[] }) {
  const suma = datos.reduce((s, d) => s + d.monto, 0)
  if (suma === 0) return <Typography color="text.secondary">Todavía no hay cobros para mostrar.</Typography>
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 170, height: 170, flexShrink: 0 }}>
        <PieChart
          height={170}
          width={170}
          hideLegend
          margin={0}
          series={[
            {
              data: datos.map((d, i) => ({ id: d.nombre, value: d.monto, label: d.nombre, color: colores[i % colores.length] })),
              innerRadius: 48,
              outerRadius: 80,
              paddingAngle: 2,
              cornerRadius: 4,
              valueFormatter: (item) => formatoPesos(item.value),
            },
          ]}
        />
      </Box>
      <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
        {datos.map((d, i) => (
          <Stack key={d.nombre} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colores[i % colores.length], flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
              {d.nombre}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatoPesos(d.monto)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 36, textAlign: 'right' }}>
              {Math.round((d.monto / suma) * 100)}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

// Pestaña "Cobros" del profesional (boceto "Mis cobros"): resumen, cobros del mes y estadísticas
export default function CobrosProfesional() {
  const theme = useTheme()
  const [hoy] = useState(() => dayjs())
  const [vista, setVista] = useState<Vista>('cobros')
  const [mes, setMes] = useState<Dayjs>(() => dayjs().startOf('month'))
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [anclaFiltros, setAnclaFiltros] = useState<HTMLElement | null>(null)
  const [comprobante, setComprobante] = useState<Cobro | null>(null)

  const carga = useCarga('mis-cobros', traerCobros)
  const todos = carga.datos?.cobros ?? []
  const cuentaDeposito = carga.datos?.cuentaDeposito ?? null

  // ---- Resumen (arriba de todo) ----
  const mesActual = hoy.format('YYYY-MM')
  const mesAnterior = hoy.subtract(1, 'month')
  const ingresosMes = total(pagados(todos).filter((c) => mesDe(c) === mesActual))
  const ingresosMesAnterior = total(pagados(todos).filter((c) => mesDe(c) === mesAnterior.format('YYYY-MM')))
  const variacion = ingresosMesAnterior > 0 ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100) : null
  // Pendiente de cobro: lo que el cliente todavía no pagó y lo que pagó pero falta depositar
  const pendientes = todos.filter((c) => c.estado === 'pendiente_cobro')
  const proximoDeposito = pendientes
    .filter((c) => c.depositoEstimado)
    .map((c) => dayjs(c.depositoEstimado))
    .sort((a, b) => a.valueOf() - b.valueOf())[0]
  const desdeHistorial = hoy.subtract(MESES_HISTORIAL - 1, 'month').startOf('month')
  const trabajosRecientes = pagados(todos).filter((c) => c.concepto === 'trabajo' && dayjs(c.fechaPago).isAfter(desdeHistorial))
  const promedio = trabajosRecientes.length ? Math.round(total(trabajosRecientes) / trabajosRecientes.length) : 0

  // ---- Cobros del mes elegido ----
  const claveMes = mes.format('YYYY-MM')
  const esMesActual = claveMes === mesActual
  // Los que el cliente todavía no pagó se muestran en el mes actual
  const delMes = todos.filter((c) => (c.fechaPago == null ? esMesActual : mesDe(c) === claveMes))
  const acumulado = total(pagados(delMes))
  const filtrados = delMes.filter((c) => pasaFiltros(c, filtros))
  const cantidadFiltros = filtros.estados.length + filtros.conceptos.length + filtros.especialidades.length
  const especialidades = [...new Set(todos.map((c) => c.especialidad).filter((e): e is string => !!e))].sort()
  const primerMes = todos.length ? dayjs(todos.map((c) => c.fechaPago ?? hoy.toISOString()).sort()[0]).startOf('month') : hoy.startOf('month')

  const irAMes = (m: Dayjs) => {
    setMes(m.startOf('month'))
    setCantidadVisible(POR_PAGINA)
  }

  // ---- Historial: últimos 6 meses ----
  const meses = Array.from({ length: MESES_HISTORIAL }, (_, i) => hoy.subtract(MESES_HISTORIAL - 1 - i, 'month').startOf('month'))
  const porMes = meses.map((m) => {
    const lista = pagados(todos).filter((c) => mesDe(c) === m.format('YYYY-MM'))
    return {
      mes: m,
      trabajos: total(lista.filter((c) => c.concepto === 'trabajo')),
      visitas: total(lista.filter((c) => c.concepto === 'visita')),
      cantidad: lista.length,
      total: total(lista),
    }
  })
  const recientes = pagados(todos).filter((c) => !dayjs(c.fechaPago).isBefore(desdeHistorial))
  const coloresTorta = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.error.light]

  const alternar = <K extends keyof Filtros>(clave: K, valor: Filtros[K][number]) =>
    setFiltros((f) => {
      const lista = f[clave] as Filtros[K][number][]
      return { ...f, [clave]: lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor] }
    })

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Mis cobros
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={carga.recargar}>
          Actualizar
        </Button>
      </Stack>

      {carga.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {carga.error}
        </Alert>
      )}

      {/* Resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {carga.cargando ? (
          [0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={104} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Metrica
                icono={<PaymentsIcon />}
                titulo={`Ingresos de ${hoy.format('MMMM')}`}
                valor={formatoPesos(ingresosMes)}
                color="success.main"
                detalle={
                  variacion == null ? (
                    'Sin cobros el mes anterior'
                  ) : (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: variacion >= 0 ? 'success.main' : 'error.main' }}>
                      {variacion >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                      <span>
                        {variacion >= 0 ? '+' : ''}
                        {variacion}% vs {mesAnterior.format('MMMM')}
                      </span>
                    </Stack>
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Metrica
                icono={<AccountBalanceIcon />}
                titulo="Pendiente de cobro"
                valor={formatoPesos(total(pendientes))}
                color="warning.main"
                detalle={
                  pendientes.length === 0
                    ? 'No tenés cobros pendientes'
                    : `${pendientes.length} cobro${pendientes.length === 1 ? '' : 's'}` +
                      (proximoDeposito ? ` · próximo depósito: ${proximoDeposito.format('ddd DD/MM')}` : '')
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Metrica
                icono={<CalculateIcon />}
                titulo="Promedio por trabajo"
                valor={formatoPesos(promedio)}
                color="primary.main"
                detalle={`${trabajosRecientes.length} trabajos en los últimos ${MESES_HISTORIAL} meses`}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={vista} onChange={(_, v: Vista) => setVista(v)} variant="fullWidth">
          <Tab value="cobros" label="Cobros" />
          <Tab value="historial" label="Historial" />
        </Tabs>
      </Paper>

      {carga.cargando ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={110} />
          <Skeleton variant="rounded" height={110} />
        </Stack>
      ) : vista === 'cobros' ? (
        <>
          {/* Mes: total acumulado y en qué estado está la plata */}
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <IconButton aria-label="Mes anterior" onClick={() => irAMes(mes.subtract(1, 'month'))} disabled={!mes.isAfter(primerMes)}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
                {capitalizar(mes.format('MMMM YYYY'))}
              </Typography>
              <IconButton aria-label="Mes siguiente" onClick={() => irAMes(mes.add(1, 'month'))} disabled={esMesActual}>
                <ChevronRightIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              <Badge badgeContent={cantidadFiltros} color="primary">
                <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnclaFiltros(e.currentTarget)}>
                  Filtros
                </Button>
              </Badge>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatoPesos(acumulado)}{' '}
              <Typography component="span" variant="h6" color="text.secondary">
                acumulado
              </Typography>
            </Typography>

            {/* Barra apilada: cobrado / pendiente de cobro */}
            {(() => {
              const partes = ORDEN_ESTADOS.map((estado) => ({ estado, monto: total(delMes.filter((c) => c.estado === estado)) }))
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
            })()}
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
                <TarjetaCobro key={c.idSolicitud} cobro={c} cuentaDeposito={cuentaDeposito} onVerComprobante={() => setComprobante(c)} />
              ))}
            </Stack>
          )}

          {filtrados.length > cantidadVisible && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={() => setCantidadVisible((c) => c + POR_PAGINA)}>Ver más ({filtrados.length - cantidadVisible})</Button>
            </Box>
          )}
        </>
      ) : (
        // Historial: gráficos de los últimos meses
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SeccionTarjeta titulo="Ingresos por mes">
              <BarChart
                height={280}
                borderRadius={6}
                margin={{ left: 0, right: 8 }}
                xAxis={[{ scaleType: 'band', data: porMes.map((m) => capitalizar(m.mes.format('MMM'))) }]}
                yAxis={[{ valueFormatter: (v: number) => pesosCorto(v), width: 48 }]}
                series={[
                  { data: porMes.map((m) => m.trabajos), label: 'Trabajos', stack: 'total', color: theme.palette.primary.main, valueFormatter: (v) => formatoPesos(v ?? 0) },
                  { data: porMes.map((m) => m.visitas), label: 'Visitas', stack: 'total', color: theme.palette.secondary.main, valueFormatter: (v) => formatoPesos(v ?? 0) },
                ]}
                onItemClick={(_, item) => {
                  irAMes(porMes[item.dataIndex].mes)
                  setVista('cobros')
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Tocá una barra para ver los cobros de ese mes.
              </Typography>
            </SeccionTarjeta>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <SeccionTarjeta titulo="Resumen por mes">
              <Stack spacing={0.5}>
                {[...porMes].reverse().map((m, i, lista) => {
                  const anterior = lista[i + 1]
                  const cambio = anterior && anterior.total > 0 ? Math.round(((m.total - anterior.total) / anterior.total) * 100) : null
                  return (
                    <ButtonBase
                      key={m.mes.format('YYYY-MM')}
                      onClick={() => {
                        irAMes(m.mes)
                        setVista('cobros')
                      }}
                      sx={{ justifyContent: 'stretch', textAlign: 'left', borderRadius: 1, px: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {capitalizar(m.mes.format('MMMM YYYY'))}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.cantidad} cobro{m.cantidad === 1 ? '' : 's'}
                          </Typography>
                        </Box>
                        {cambio != null && (
                          <Chip
                            size="small"
                            variant="outlined"
                            color={cambio >= 0 ? 'success' : 'error'}
                            label={`${cambio >= 0 ? '+' : ''}${cambio}%`}
                          />
                        )}
                        <Typography sx={{ fontWeight: 700, minWidth: 96, textAlign: 'right' }}>{formatoPesos(m.total)}</Typography>
                        <ChevronRightIcon fontSize="small" color="action" />
                      </Stack>
                    </ButtonBase>
                  )
                })}
              </Stack>
            </SeccionTarjeta>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SeccionTarjeta titulo="Por especialidad">
              <Torta datos={agrupar(recientes, (c) => c.especialidad ?? 'Otras')} colores={coloresTorta} />
            </SeccionTarjeta>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SeccionTarjeta titulo="Medios de pago">
              <Torta datos={agrupar(recientes, (c) => c.medioDePago ?? 'Mercado Pago')} colores={coloresTorta} />
            </SeccionTarjeta>
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" color="text.secondary">
              Los gráficos muestran lo que pagaron tus clientes en los últimos {MESES_HISTORIAL} meses. El depósito llega a tu
              CBU/CVU{cuentaDeposito ? ` terminado en ${cuentaDeposito}` : ''} a los 3 días hábiles de cada pago.
            </Typography>
          </Grid>
        </Grid>
      )}

      {/* Filtros de la lista del mes */}
      <Popover
        open={anclaFiltros !== null}
        anchorEl={anclaFiltros}
        onClose={() => setAnclaFiltros(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack spacing={2} sx={{ p: 2, maxWidth: 320 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Estado
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {ORDEN_ESTADOS.map((e) => (
                <Chip
                  key={e}
                  label={estadosCobro[e].label}
                  color={filtros.estados.includes(e) ? estadosCobro[e].color : 'default'}
                  variant={filtros.estados.includes(e) ? 'filled' : 'outlined'}
                  onClick={() => alternar('estados', e)}
                />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Concepto
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['trabajo', 'visita'] as const).map((c) => (
                <Chip
                  key={c}
                  label={c === 'trabajo' ? 'Trabajos' : 'Visitas'}
                  color={filtros.conceptos.includes(c) ? 'primary' : 'default'}
                  variant={filtros.conceptos.includes(c) ? 'filled' : 'outlined'}
                  onClick={() => alternar('conceptos', c)}
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
                {especialidades.map((e) => (
                  <Chip
                    key={e}
                    label={e}
                    color={filtros.especialidades.includes(e) ? 'primary' : 'default'}
                    variant={filtros.especialidades.includes(e) ? 'filled' : 'outlined'}
                    onClick={() => alternar('especialidades', e)}
                  />
                ))}
              </Stack>
            </Box>
          )}
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Button onClick={() => setFiltros(SIN_FILTROS)} disabled={cantidadFiltros === 0}>
              Limpiar
            </Button>
            <Button variant="contained" onClick={() => setAnclaFiltros(null)}>
              Listo
            </Button>
          </Stack>
        </Stack>
      </Popover>

      <ComprobanteDialog cobro={comprobante} cuentaDeposito={cuentaDeposito} onClose={() => setComprobante(null)} />
    </>
  )
}