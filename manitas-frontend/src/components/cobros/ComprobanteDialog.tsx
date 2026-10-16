import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import HandymanIcon from '@mui/icons-material/Handyman'
import { estadosCobro, formatoPesos, numeroComprobante } from './estadosCobro'
import type { Cobro } from '../../types'

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {valor}
      </Typography>
    </Stack>
  )
}

// Comprobante del pago que hizo el cliente por la app ("Ver factura" del boceto).
// Es un comprobante interno: la app no emite facturas fiscales
export default function ComprobanteDialog({ cobro: c, cuentaDeposito, onClose }: { cobro: Cobro | null; cuentaDeposito: string | null; onClose: () => void }) {
  return (
    <Dialog open={c !== null} onClose={onClose} maxWidth="xs" fullWidth>
      {c && (
        <>
          <DialogContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'primary.main' }}>
                <HandymanIcon />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Manitas
                </Typography>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Comprobante de pago
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nº {numeroComprobante(c)}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Fila label="Fecha de pago" valor={dayjs(c.fechaPago).format('DD/MM/YYYY HH:mm')} />
              <Fila label="Cliente" valor={`${c.cliente.nombre} ${c.cliente.apellido}`} />
              <Fila label="Concepto" valor={c.concepto === 'visita' ? 'Visita' : 'Trabajo'} />
              {c.especialidad && <Fila label="Especialidad" valor={c.especialidad} />}
              <Typography variant="body2" sx={{ pt: 0.5 }}>
                {c.descripcionProblema}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Fila label="Medio de pago" valor={c.medioDePago ?? 'Tarjeta'} />
              <Fila label="Se deposita en" valor={cuentaDeposito ? `CBU/CVU terminado en ${cuentaDeposito}` : 'Tu CBU/CVU'} />
              <Fila
                label={c.estado === 'cobrado' ? 'Depositado el' : 'Depósito estimado'}
                valor={dayjs(c.depositoEstimado).format('DD/MM/YYYY')}
              />
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatoPesos(c.monto)}
                </Typography>
              </Stack>
              <Chip
                size="small"
                color={estadosCobro[c.estado].color}
                label={estadosCobro[c.estado].label}
                sx={{ alignSelf: 'flex-end', fontWeight: 600 }}
              />
            </Stack>

            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
              Comprobante interno de Manitas del pago hecho por la app. No es una factura fiscal.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" onClick={onClose}>
              Cerrar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}