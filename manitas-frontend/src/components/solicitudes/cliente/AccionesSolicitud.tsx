import Button from '@mui/material/Button'
import StarIcon from '@mui/icons-material/Star'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import CheckoutButton from '../../pagos/CheckoutButton'
import { accionesDelDetalle } from './acciones'
import type { SolicitudResumen } from '../../../types'

interface Props {
  solicitud: SolicitudResumen
  // Mientras se manda una respuesta, los botones quedan deshabilitados
  ocupado: boolean
  onCancelar: () => void
  onRechazarPresupuesto: () => void
  onAceptarPresupuesto: () => void
  onReprogramar: () => void
  onAceptarHorario: () => void
  onCalificar: () => void
}

// En el detalle: un botón por cada acción que permite el estado (ver acciones.ts)
export default function AccionesSolicitud({
  solicitud: s,
  ocupado,
  onCancelar,
  onRechazarPresupuesto,
  onAceptarPresupuesto,
  onReprogramar,
  onAceptarHorario,
  onCalificar,
}: Props) {
  return accionesDelDetalle(s).map((accion) => {
    switch (accion) {
      case 'cancelar':
        return (
          <Button key={accion} color="error" disabled={ocupado} onClick={onCancelar} sx={{ mr: 'auto' }}>
            Cancelar solicitud
          </Button>
        )
      case 'rechazarPresupuesto':
        return (
          <Button key={accion} variant="outlined" color="error" disabled={ocupado} onClick={onRechazarPresupuesto}>
            Rechazar
          </Button>
        )
      case 'aceptarPresupuesto':
        return (
          <Button key={accion} variant="contained" color="success" onClick={onAceptarPresupuesto}>
            Aceptar presupuesto
          </Button>
        )
      case 'reprogramar':
        return (
          <Button key={accion} startIcon={<EventRepeatIcon />} disabled={ocupado} onClick={onReprogramar}>
            {s.estadoServicio === 'reprogramacion' ? 'Proponer otro' : 'Cambiar horario'}
          </Button>
        )
      case 'aceptarHorario':
        return (
          <Button key={accion} variant="contained" color="success" loading={ocupado} onClick={onAceptarHorario}>
            Aceptar horario
          </Button>
        )
      case 'pagar':
        // Va a Mercado Pago; al tocar "Volver al sitio" vuelve a "Mis solicitudes" y se confirma el pago
        return <CheckoutButton key={accion} idSolicitud={s.idSolicitud} />
      case 'calificar':
        return (
          <Button key={accion} variant="contained" startIcon={<StarIcon />} onClick={onCalificar}>
            Calificar
          </Button>
        )
    }
  })
}