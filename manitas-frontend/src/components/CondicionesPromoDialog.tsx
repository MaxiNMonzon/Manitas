import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { PromoBancaria } from '../mocks/inicioCliente'

// "Ver condiciones" de una promo bancaria: todo el detalle que no entra en la tarjeta.
// El reintegro lo hace el banco
export default function CondicionesPromoDialog({ promo, onCerrar }: { promo: PromoBancaria | null; onCerrar: () => void }) {
  return (
    <Dialog open={promo !== null} onClose={onCerrar} fullWidth maxWidth="xs">
      {promo && (
        <>
          <DialogTitle>
            {promo.titulo} · {promo.banco}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              {promo.condiciones && <Dato titulo="Condiciones" texto={promo.condiciones} />}
              {promo.tarjetas && promo.tarjetas.length > 0 && (
                <Dato titulo="Tarjetas que participan" texto={`${promo.tarjetas.join(', ')} del ${promo.banco}`} />
              )}
              {promo.vigencia && <Dato titulo="Vigencia" texto={promo.vigencia} />}
              <Dato
                titulo="Cómo se recibe"
                texto="Pagá con Mercado Pago usando una de las tarjetas participantes. El reintegro lo hace el banco: si es de crédito, en el próximo resumen; si es de débito, en tu cuenta en hasta 5 días hábiles."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCerrar}>Cerrar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

function Dato({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <Typography variant="subtitle2">{titulo}</Typography>
      <Typography variant="body2" color="text.secondary">
        {texto}
      </Typography>
    </div>
  )
}