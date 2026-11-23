import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import dayjs from 'dayjs'
import AvatarPersona from '../AvatarPersona'
import { estadosCobro, formatoPesos } from './estadosCobro'
import type { Cobro } from '../../types'

interface Props {
  cobro: Cobro
  cuentaDeposito: string | null
  onVerComprobante: () => void
}

// Un cobro de la lista (boceto "Mis cobros"): cliente, trabajo y monto; a la derecha el estado,
// el comprobante y cuándo se deposita
export default function TarjetaCobro({ cobro, cuentaDeposito, onVerComprobante }: Props) {
  const { label, color } = estadosCobro[cobro.estado]
  const cuenta = cuentaDeposito ? `tu CBU/CVU terminado en ${cuentaDeposito}` : 'tu CBU/CVU'

  // Debajo del botón: qué pasa con la plata
  const nota =
    cobro.estado === 'cobrado'
      ? { texto: `Depositado el ${dayjs(cobro.depositoEstimado).format('DD/MM')}`, ayuda: `Se depositó en ${cuenta}.` }
      : cobro.fechaPago
        ? {
            texto: `Depósito estimado: ${dayjs(cobro.depositoEstimado).format('DD/MM')}`,
            ayuda: `El cliente pagó el ${dayjs(cobro.fechaPago).format('DD/MM')}. Se deposita en ${cuenta} a los 3 días hábiles del pago.`,
          }
        : {
            texto: cobro.fechaServicio ? `Trabajo del ${dayjs(cobro.fechaServicio).format('DD/MM')}` : 'Trabajo aceptado',
            ayuda: 'El cliente paga desde la app cuando terminás el trabajo. Después se deposita a los 3 días hábiles.',
          }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, minWidth: 0, alignItems: 'center' }}>
          <AvatarPersona nombre={cobro.cliente.nombre} apellido={cobro.cliente.apellido} tamaño={52} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {cobro.cliente.nombre} {cobro.cliente.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {cobro.descripcionProblema}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {formatoPesos(cobro.monto)}
              </Typography>
              {cobro.especialidad && <Chip size="small" variant="outlined" label={cobro.especialidad} />}
              {cobro.concepto === 'visita' && <Chip size="small" variant="outlined" color="secondary" label="Visita" />}
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={0.75} sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' }, flexShrink: 0, minWidth: { sm: 200 } }}>
          <Chip color={color} label={label} sx={{ fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'flex-end' } }} />
          {cobro.fechaPago && (
            <Button size="small" variant="outlined" startIcon={<ReceiptLongIcon />} onClick={onVerComprobante}>
              Ver comprobante
            </Button>
          )}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: { sm: 'flex-end' } }}>
            <Typography variant="caption" color="text.secondary">
              {nota.texto}
            </Typography>
            <Tooltip title={nota.ayuda} arrow enterTouchDelay={0}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}