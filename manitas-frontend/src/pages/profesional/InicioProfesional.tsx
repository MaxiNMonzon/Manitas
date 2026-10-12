import { useState, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import dayjs, { type Dayjs } from 'dayjs'
import { traerAgenda, traerMisSolicitudes } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import CalendarioMensual from '../../components/agenda/CalendarioMensual'
import ItemAgenda from '../../components/agenda/ItemAgenda'
import AgendarDialog from '../../components/agenda/AgendarDialog'
import type { EventoAgenda, SolicitudResumen } from '../../types'

const PLAZO_PARA_AGENDAR_HS = 48 // igual que el back: después vence

function Seccion({ titulo, extra, children }: { titulo: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
        {extra}
      </Stack>
      {children}
    </Paper>
  )
}

function ListaDeEventos({ eventos, cargando, vacio }: { eventos: EventoAgenda[]; cargando: boolean; vacio: string }) {
  if (cargando) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={110} />
        <Skeleton variant="rounded" height={110} />
      </Stack>
    )
  }
  if (eventos.length === 0) {
    return <Typography color="text.secondary">{vacio}</Typography>
  }
  return (
    <Stack spacing={1.5}>
      {eventos.map((e) => (
        <ItemAgenda key={`${e.idSolicitud}-${e.tipo}`} evento={e} />
      ))}
    </Stack>
  )
}

function horasQueQuedan(s: SolicitudResumen): number {
  const pasadas = (Date.now() - new Date(s.fechaCambioEstado).getTime()) / (1000 * 60 * 60)
  return Math.max(0, Math.floor(PLAZO_PARA_AGENDAR_HS - pasadas))
}

// Pantalla principal del profesional: su agenda de visitas y trabajos
export default function InicioProfesional() {
  const hoy = dayjs().format('YYYY-MM-DD')
  const [mes, setMes] = useState<Dayjs>(dayjs().startOf('month'))
  const [diaElegido, setDiaElegido] = useState<Dayjs>(dayjs())
  const [aAgendar, setAAgendar] = useState<SolicitudResumen | null>(null)

  const agendaHoy = useCarga(`hoy-${hoy}`, () => traerAgenda(hoy, hoy))
  const agendaMes = useCarga(`mes-${mes.format('YYYY-MM')}`, () =>
    traerAgenda(mes.startOf('month').format('YYYY-MM-DD'), mes.endOf('month').format('YYYY-MM-DD')),
  )
  const solicitudes = useCarga('mis-solicitudes', traerMisSolicitudes)

  // Las que el profesional aceptó y todavía no tienen fecha: vencen a las 48 h
  const pendientes = (solicitudes.datos ?? [])
    .filter((s) => s.estadoServicio === 'en_coordinacion')
    .sort((a, b) => horasQueQuedan(a) - horasQueQuedan(b))

  // Lo del día elegido en el calendario (incluye trabajos de varios días que pasan por ese día)
  const delDia = (agendaMes.datos ?? []).filter(
    (e) => dayjs(e.inicio).isBefore(diaElegido.endOf('day')) && dayjs(e.fin).isAfter(diaElegido.startOf('day')),
  )

  const error = agendaHoy.error ?? agendaMes.error ?? solicitudes.error

  const recargarTodo = () => {
    agendaHoy.recargar()
    agendaMes.recargar()
    solicitudes.recargar()
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Tu agenda
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, '&::first-letter': { textTransform: 'uppercase' } }}>
        {dayjs().format('dddd D [de] MMMM')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Hoy */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Seccion
            titulo="Hoy"
            extra={agendaHoy.datos && <Chip size="small" label={`${agendaHoy.datos.length} en agenda`} />}
          >
            <ListaDeEventos
              eventos={agendaHoy.datos ?? []}
              cargando={agendaHoy.cargando}
              vacio="No tenés visitas ni trabajos para hoy."
            />
          </Seccion>
        </Grid>

        {/* Pendientes de fecha */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Seccion
            titulo="Pendientes de fecha"
            extra={pendientes.length > 0 && <Chip size="small" color="warning" label={pendientes.length} />}
          >
            {solicitudes.cargando ? (
              <Skeleton variant="rounded" height={90} />
            ) : pendientes.length === 0 ? (
              <Typography color="text.secondary">No tenés solicitudes esperando fecha.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {pendientes.map((s) => {
                  const horas = horasQueQuedan(s)
                  return (
                    <Paper key={s.idSolicitud} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
                            {s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}` : 'Cliente'}
                            {s.especialidad && (
                              <Typography component="span" color="text.secondary">
                                {' '}
                                · {s.especialidad.nombreEspecialidad}
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="body2" color={horas <= 12 ? 'error' : 'text.secondary'}>
                            {s.costoEstimado != null ? 'Trabajo' : 'Visita'} · vence en {horas} h
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EventAvailableIcon />}
                          onClick={() => setAAgendar(s)}
                          sx={{ flexShrink: 0 }}
                        >
                          Agendar
                        </Button>
                      </Stack>
                    </Paper>
                  )
                })}
              </Stack>
            )}
          </Seccion>
        </Grid>

        {/* Calendario del mes + lo del día elegido */}
        <Grid size={12}>
          <Seccion titulo="Calendario">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CalendarioMensual
                  eventos={agendaMes.datos ?? []}
                  diaElegido={diaElegido}
                  onElegirDia={setDiaElegido}
                  onCambiarMes={(m) => setMes(m.startOf('month'))}
                  cargando={agendaMes.cargando}
                />
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Referencia color="primary.main" texto="Visita" />
                  <Referencia color="secondary.main" texto="Trabajo" />
                  <Referencia color="error.main" texto="Urgente" />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, '&::first-letter': { textTransform: 'uppercase' } }}>
                  {diaElegido.format('dddd D [de] MMMM')}
                </Typography>
                <ListaDeEventos eventos={delDia} cargando={agendaMes.cargando} vacio="Día libre." />
              </Grid>
            </Grid>
          </Seccion>
        </Grid>
      </Grid>

      <AgendarDialog solicitud={aAgendar} onClose={() => setAAgendar(null)} onAgendado={recargarTodo} />
    </>
  )
}

function Referencia({ color, texto }: { color: string; texto: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {texto}
      </Typography>
    </Stack>
  )
}
