import Button from '@mui/material/Button'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import { accionesDelDetalle, esperaRespuestaDeHorario, puedePresupuestar } from './acciones'
import type { SolicitudResumen } from '../../../types'

// En la tarjeta: el botón de la acción que le toca a cada estado (las nuevas se responden en el detalle)
export function AccionTarjeta({
  solicitud: s,
  onPresupuestar,
  onResponderHorario,
}: {
  solicitud: SolicitudResumen
  onPresupuestar: () => void
  onResponderHorario: () => void
}) {
  if (puedePresupuestar(s)) {
    return (
      <Button size="small" variant="contained" color="secondary" startIcon={<RequestQuoteIcon />} onClick={onPresupuestar}>
        Enviar presupuesto
      </Button>
    )
  }
  if (esperaRespuestaDeHorario(s)) {
    return (
      <Button size="small" variant="contained" color="warning" startIcon={<EventRepeatIcon />} onClick={onResponderHorario}>
        Responder horario
      </Button>
    )
  }
  return null
}

interface PropsDetalle {
  solicitud: SolicitudResumen
  // Mientras se manda una respuesta, los botones quedan deshabilitados
  ocupado: boolean
  onReprogramar: () => void
  onRechazar: () => void
  onAceptar: () => void
  onResponderHorario: (acepta: boolean) => void
  onPresupuestar: () => void
}

// En el detalle: un botón por cada acción que permite el estado (ver acciones.ts)
export function AccionesDetalle({ solicitud: s, ocupado, onReprogramar, onRechazar, onAceptar, onResponderHorario, onPresupuestar }: PropsDetalle) {
  return accionesDelDetalle(s).map((accion) => {
    switch (accion) {
      case 'reprogramar':
        return (
          <Button key={accion} startIcon={<EventRepeatIcon />} disabled={ocupado} onClick={onReprogramar} sx={{ mr: 'auto' }}>
            {s.estadoServicio === 'reprogramacion' ? 'Proponer otro' : 'Proponer otro horario'}
          </Button>
        )
      case 'rechazar':
        return (
          <Button key={accion} variant="outlined" color="error" disabled={ocupado} onClick={onRechazar}>
            Rechazar
          </Button>
        )
      case 'aceptar':
        return (
          <Button key={accion} variant="contained" color="success" loading={ocupado} onClick={onAceptar}>
            Aceptar
          </Button>
        )
      case 'mantenerHorario':
        return (
          <Button key={accion} variant="outlined" disabled={ocupado} onClick={() => onResponderHorario(false)}>
            Mantener el mío
          </Button>
        )
      case 'aceptarHorario':
        return (
          <Button key={accion} variant="contained" color="success" loading={ocupado} onClick={() => onResponderHorario(true)}>
            Aceptar horario
          </Button>
        )
      case 'presupuestar':
        return (
          <Button key={accion} variant="contained" color="secondary" startIcon={<RequestQuoteIcon />} onClick={onPresupuestar}>
            Enviar presupuesto
          </Button>
        )
      case 'cambiarPrecio':
        return (
          <Button key={accion} variant="outlined" startIcon={<RequestQuoteIcon />} onClick={onPresupuestar}>
            Cambiar precio
          </Button>
        )
    }
  })
}