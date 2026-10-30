import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import CampaignIcon from '@mui/icons-material/Campaign'
import dayjs from 'dayjs'
import { traerMisSolicitudes, traerSolicitudesCliente } from '../api/solicitudes'
import { laCambieYo } from '../api/misAcciones'
import { useAuth } from '../auth/useAuth'
import { useCarga } from '../hooks/useCarga'
import { formatoFecha, formatoPesos } from './solicitudes/estados'
import type { Rol, SolicitudResumen } from '../types'

// Lo que importa del estado para avisar: el estado y, en un cambio de horario, quién lo propuso
const firma = (s: SolicitudResumen) => `${s.estadoServicio}|${s.propuestaDe ?? ''}`

// Cómo estaba cada solicitud la última vez que la viste (en el navegador, por cuenta)
function leer(clave: string): Record<string, string> | null {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

function guardar(clave: string, vistos: Record<string, string>) {
  try {
    localStorage.setItem(clave, JSON.stringify(vistos))
  } catch {
    // Sin almacenamiento (ej: ventana privada): no se recuerdan, no pasa nada
  }
}

// El aviso de un cambio que hizo la otra persona (null si no hay nada que avisar)
function mensajeDe(rol: Rol, s: SolicitudResumen, antes: string): string | null {
  const fecha = (f?: string | null) => (f ? formatoFecha(f) : '')
  if (rol === 'cliente') {
    const p = s.profesional?.nombre ?? 'El profesional'
    switch (s.estadoServicio) {
      case 'agendado':
        if (antes === 'reprogramacion') return `${p} aceptó el nuevo horario: la visita queda para el ${fecha(s.fechaVisita)}`
        if (s.urgente && s.fechaVisita) return `${p} tomó tu urgencia: llega a las ${dayjs(s.fechaVisita).format('HH:mm')}`
        return `${p} confirmó tu visita del ${fecha(s.fechaVisita)}`
      case 'contratado':
        return antes === 'reprogramacion' ? `${p} aceptó el nuevo horario del trabajo (${fecha(s.fechaInicio)})` : null
      case 'reprogramacion':
        return s.propuestaDe === 'profesional' ? `${p} te propone otro horario: respondé en Mis solicitudes (tenés 24 h)` : null
      case 'presupuestado':
        return `${p} te mandó un presupuesto de ${formatoPesos(s.costoFinal)}`
      case 'rechazado':
        return antes === 'solicitado' ? `${p} no puede tomar tu solicitud` : null
      case 'cancelado':
        return `Se canceló tu solicitud con ${p}`
      case 'expirado':
        return `Tu solicitud con ${p} venció sin respuesta`
      default:
        return null
    }
  }
  const c = s.cliente?.nombre ?? 'El cliente'
  switch (s.estadoServicio) {
    case 'contratado':
      return antes === 'reprogramacion'
        ? `${c} aceptó el nuevo horario del trabajo (${fecha(s.fechaInicio)})`
        : `${c} aceptó tu presupuesto de ${formatoPesos(s.costoFinal)}`
    case 'agendado':
      return antes === 'reprogramacion' ? `${c} aceptó el nuevo horario de la visita (${fecha(s.fechaVisita)})` : null
    case 'reprogramacion':
      return s.propuestaDe === 'cliente' ? `${c} te propone otro horario: respondé en Solicitudes` : null
    case 'rechazado':
      return antes === 'presupuestado' ? `${c} rechazó tu presupuesto` : null
    case 'cancelado':
      return `${c} canceló la solicitud`
    case 'expirado':
      return `La solicitud de ${c} venció`
    case 'finalizado':
      return `${c} pagó ${formatoPesos(s.costoFinal)}`
    default:
      return null
  }
}

// Cartel de novedades del Inicio (mismo estilo que el de solicitudes nuevas del profesional): cada cambio
// de estado que hizo la otra persona (el profesional confirmó la visita, el cliente aceptó el presupuesto...)
// aparece hasta que lo ves ("Ver") o marcás todas como vistas. Lo que cambiaste vos no se avisa
// `sx`: para separarlo de lo que tenga arriba (ej: el buscador del cliente)
export default function NovedadesInicio({ rol, sx }: { rol: Rol; sx?: object }) {
  const navigate = useNavigate()
  const { sesion } = useAuth()
  const clave = `manitas.estadosVistos.${rol}.${sesion?.correo ?? ''}`
  const [, setVersion] = useState(0)
  const { datos } = useCarga(`novedades-${rol}`, rol === 'cliente' ? traerSolicitudesCliente : traerMisSolicitudes)
  const vistos = leer(clave)

  // La primera vez se guarda cómo está todo (sin avisar), y las solicitudes nuevas se van sumando
  useEffect(() => {
    if (!datos) return
    const actuales = leer(clave) ?? {}
    const faltan = datos.filter((s) => actuales[s.idSolicitud] === undefined)
    if (faltan.length > 0) {
      faltan.forEach((s) => (actuales[s.idSolicitud] = firma(s)))
      guardar(clave, actuales)
    }
  }, [datos, clave])

  const novedades = vistos
    ? (datos ?? [])
        .filter((s) => vistos[s.idSolicitud] !== undefined && vistos[s.idSolicitud] !== firma(s))
        .filter((s) => !laCambieYo(s.idSolicitud, s.fechaCambioEstado))
        .map((s) => ({ s, mensaje: mensajeDe(rol, s, vistos[s.idSolicitud].split('|')[0]) }))
        .filter((n): n is { s: SolicitudResumen; mensaje: string } => n.mensaje !== null)
    : []

  if (novedades.length === 0) return null

  // Marca como vista (al tocar "Entendido" o "Ver")
  const marcarVistas = (cuales: SolicitudResumen[]) => {
    const todos = { ...(vistos ?? {}) }
    cuales.forEach((s) => (todos[s.idSolicitud] = firma(s)))
    guardar(clave, todos)
    setVersion((v) => v + 1)
  }

  const ver = (s: SolicitudResumen) => {
    marcarVistas([s])
    navigate('/app/solicitudes', { state: { abrir: s.idSolicitud } })
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderColor: 'info.main', bgcolor: (t) => alpha(t.palette.info.main, 0.06), ...sx }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'info.main', mb: 2 }}>
        <CampaignIcon />
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Novedades de tus solicitudes
        </Typography>
        <Chip size="small" color="info" label={novedades.length} />
      </Stack>
      <Stack spacing={1.5}>
        {novedades.map(({ s, mensaje }) => (
          <Paper key={s.idSolicitud} variant="outlined" sx={{ p: 2, borderLeft: 5, borderLeftColor: 'info.main' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{mensaje}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {s.especialidad ? `${s.especialidad.nombreEspecialidad} · ` : ''}
                  {s.descripcionProblema}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Button variant="outlined" color="info" onClick={() => marcarVistas([s])}>
                  Entendido
                </Button>
                <Button variant="contained" color="info" onClick={() => ver(s)}>
                  Ver
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}