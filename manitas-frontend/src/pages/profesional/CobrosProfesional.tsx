import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import RefreshIcon from '@mui/icons-material/Refresh'
import dayjs, { type Dayjs } from 'dayjs'
import { traerCobros } from '../../api/cobros'
import { useCarga } from '../../hooks/useCarga'
import ResumenCobros from '../../components/cobros/ResumenCobros'
import CobrosDelMes from '../../components/cobros/CobrosDelMes'
import HistorialCobros from '../../components/cobros/HistorialCobros'
import ComprobanteDialog from '../../components/cobros/ComprobanteDialog'
import type { Cobro } from '../../types'

type Vista = 'cobros' | 'historial'

// Pestaña "Cobros" del profesional (boceto "Mis cobros"): resumen, cobros del mes y estadísticas.
// Esta página solo coordina: las cuentas están en cobros/calculos.ts y cada parte en su componente
export default function CobrosProfesional() {
  const [hoy] = useState(() => dayjs())
  const [vista, setVista] = useState<Vista>('cobros')
  const [mes, setMes] = useState<Dayjs>(() => dayjs().startOf('month'))
  const [comprobante, setComprobante] = useState<Cobro | null>(null)

  const carga = useCarga('mis-cobros', traerCobros)
  const todos = carga.datos?.cobros ?? []
  const cuentaDeposito = carga.datos?.cuentaDeposito ?? null

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

      <ResumenCobros todos={todos} hoy={hoy} cargando={carga.cargando} />

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
        <CobrosDelMes
          todos={todos}
          mes={mes}
          hoy={hoy}
          onCambiarMes={(m) => setMes(m.startOf('month'))}
          cuentaDeposito={cuentaDeposito}
          onVerComprobante={setComprobante}
        />
      ) : (
        <HistorialCobros
          todos={todos}
          hoy={hoy}
          cuentaDeposito={cuentaDeposito}
          // Desde el historial, al tocar un mes se ven sus cobros
          onElegirMes={(m) => {
            setMes(m.startOf('month'))
            setVista('cobros')
          }}
        />
      )}

      <ComprobanteDialog cobro={comprobante} cuentaDeposito={cuentaDeposito} onClose={() => setComprobante(null)} />
    </>
  )
}