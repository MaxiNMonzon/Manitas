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
import { estadosVistosStorage } from '../api/almacenamiento'
import { useAuth } from '../auth/useAuth'
import { useCarga } from '../hooks/useCarga'
import { formatoFecha, formatoPesos } from './solicitudes/estados'
import type { Rol, SolicitudResumen } from '../types'

// Lo que importa del estado para avisar: el estado y, en un cambio de horario, quién lo propuso
const firma = (solicitud: SolicitudResumen) => `${solicitud.estadoServicio}|${solicitud.propuestaDe ?? ''}`


// El aviso de un cambio que hizo la otra persona (null si no hay nada que avisar)
function mensajeDe(rol: Rol, solicitud: SolicitudResumen, antes: string): string | null {
  const fecha = (valor?: string | null) => (valor ? formatoFecha(valor) : '')
  if (rol === 'cliente') {
    const nombreProfesional = solicitud.profesional?.nombre ?? 'El profesional'
    switch (solicitud.estadoServicio) {
      case 'agendado':
        if (antes === 'reprogramacion') return `${nombreProfesional} aceptó el nuevo horario: la visita queda para el ${fecha(solicitud.fechaVisita)}`
        if (solicitud.urgente && solicitud.fechaVisita) return `${nombreProfesional} tomó tu urgencia: llega a las ${dayjs(solicitud.fechaVisita).format('HH:mm')}`
        return `${nombreProfesional} confirmó tu visita del ${fecha(solicitud.fechaVisita)}`
      case 'contratado':
        return antes === 'reprogramacion' ? `${nombreProfesional} aceptó el nuevo horario del trabajo (${fecha(solicitud.fechaInicio)})` : null
      case 'reprogramacion':
        return solicitud.propuestaDe === 'profesional' ? `${nombreProfesional} te propone otro horario: respondé en Mis solicitudes (tenés 24 h)` : null
      case 'presupuestado':
        return `${nombreProfesional} te mandó un presupuesto de ${formatoPesos(solicitud.costoFinal)}`
      case 'rechazado':
        return antes === 'solicitado' ? `${nombreProfesional} no puede tomar tu solicitud` : null
      case 'cancelado':
        return `Se canceló tu solicitud con ${nombreProfesional}`
      case 'expirado':
        return `Tu solicitud con ${nombreProfesional} venció sin respuesta`
      default:
        return null
    }
  }
  const nombreCliente = solicitud.cliente?.nombre ?? 'El cliente'
  switch (solicitud.estadoServicio) {
    case 'contratado':
      return antes === 'reprogramacion'
        ? `${nombreCliente} aceptó el nuevo horario del trabajo (${fecha(solicitud.fechaInicio)})`
        : `${nombreCliente} aceptó tu presupuesto de ${formatoPesos(solicitud.costoFinal)}`
    case 'agendado':
      return antes === 'reprogramacion' ? `${nombreCliente} aceptó el nuevo horario de la visita (${fecha(solicitud.fechaVisita)})` : null
    case 'reprogramacion':
      return solicitud.propuestaDe === 'cliente' ? `${nombreCliente} te propone otro horario: respondé en Solicitudes` : null
    case 'rechazado':
      return antes === 'presupuestado' ? `${nombreCliente} rechazó tu presupuesto` : null
    case 'cancelado':
      return `${nombreCliente} canceló la solicitud`
    case 'expirado':
      return `La solicitud de ${nombreCliente} venció`
    case 'finalizado':
      return `${nombreCliente} pagó ${formatoPesos(solicitud.costoFinal)}`
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
  // Cómo estaba cada solicitud la última vez que la viste (en el navegador, por cuenta)
  const correo = sesion?.correo ?? ''
  const [, setVersion] = useState(0)
  const { datos } = useCarga(`novedades-${rol}`, rol === 'cliente' ? traerSolicitudesCliente : traerMisSolicitudes)
  const vistos = estadosVistosStorage.get(rol, correo)

  // La primera vez se guarda cómo está todo (sin avisar), y las solicitudes nuevas se van sumando
  useEffect(() => {
    if (!datos) return
    const actuales = estadosVistosStorage.get(rol, correo) ?? {}
    const faltan = datos.filter((solicitud) => actuales[solicitud.idSolicitud] === undefined)
    if (faltan.length > 0) {
      faltan.forEach((solicitud) => (actuales[solicitud.idSolicitud] = firma(solicitud)))
      estadosVistosStorage.set(rol, correo, actuales)
    }
  }, [datos, rol, correo])

  const novedades = vistos
    ? (datos ?? [])
        .filter((solicitud) => vistos[solicitud.idSolicitud] !== undefined && vistos[solicitud.idSolicitud] !== firma(solicitud))
        .filter((solicitud) => !laCambieYo(solicitud.idSolicitud, solicitud.fechaCambioEstado))
        .map((solicitud) => ({ solicitud, mensaje: mensajeDe(rol, solicitud, vistos[solicitud.idSolicitud].split('|')[0]) }))
        .filter((novedad): novedad is { solicitud: SolicitudResumen; mensaje: string } => novedad.mensaje !== null)
    : []

  if (novedades.length === 0) return null

  // Marca como vista (al tocar "Entendido" o "Ver")
  const marcarVistas = (cuales: SolicitudResumen[]) => {
    const todos = { ...(vistos ?? {}) }
    cuales.forEach((solicitud) => (todos[solicitud.idSolicitud] = firma(solicitud)))
    estadosVistosStorage.set(rol, correo, todos)
    setVersion((anterior) => anterior + 1)
  }

  const ver = (solicitud: SolicitudResumen) => {
    marcarVistas([solicitud])
    navigate('/app/solicitudes', { state: { abrir: solicitud.idSolicitud } })
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderColor: 'info.main', bgcolor: (tema) => alpha(tema.palette.info.main, 0.06), ...sx }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'info.main', mb: 2 }}>
        <CampaignIcon />
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Novedades de tus solicitudes
        </Typography>
        <Chip size="small" color="info" label={novedades.length} />
      </Stack>
      <Stack spacing={1.5}>
        {novedades.map(({ solicitud, mensaje }) => (
          <Paper key={solicitud.idSolicitud} variant="outlined" sx={{ p: 2, borderLeft: 5, borderLeftColor: 'info.main' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{mensaje}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {solicitud.especialidad ? `${solicitud.especialidad.nombreEspecialidad} · ` : ''}
                  {solicitud.descripcionProblema}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Button variant="outlined" color="info" onClick={() => marcarVistas([solicitud])}>
                  Entendido
                </Button>
                <Button variant="contained" color="info" onClick={() => ver(solicitud)}>
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