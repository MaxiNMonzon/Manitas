import { useState, type ReactElement, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AssignmentIcon from '@mui/icons-material/Assignment'
import HelpCenterIcon from '@mui/icons-material/HelpCenter'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import StarIcon from '@mui/icons-material/Star'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import dayjs from 'dayjs'
import { aceptarSolicitud, traerAgenda, traerMiCalificacion, traerMisSolicitudes, traerUrgentes } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
// MEDIDOR DE CARGA (desactivado, archivo local sin subir; ver NOTAS-SESION.md punto 23):
// import { useMedidorDeCarga } from '../../hooks/useMedidorDeCarga'
// import MedidorCarga from '../../components/MedidorCarga'
import UrgenciasCerca from '../../components/solicitudes/UrgenciasCerca'
import AgendarDialog from '../../components/agenda/AgendarDialog'
import MedidorCalificacion from '../../components/profesional/MedidorCalificacion'
import ListaDeEventos from '../../components/agenda/ListaDeEventos'
import SeccionTarjeta from '../../components/SeccionTarjeta'
import TiempoLlegadaDialog, { type UrgenteAAceptar } from '../../components/solicitudes/TiempoLlegadaDialog'
import type { SolicitudResumen } from '../../types'

const PLAZO_PARA_AGENDAR_HS = 48 // igual que el back: después vence
const CADA_UN_MINUTO = 60 * 1000 // las urgentes vencen en 1 hora: se revisan seguido

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function horasQueQuedan(s: SolicitudResumen): number {
  const pasadas = (Date.now() - new Date(s.fechaCambioEstado).getTime()) / (1000 * 60 * 60)
  return Math.max(0, Math.floor(PLAZO_PARA_AGENDAR_HS - pasadas))
}

// Números del resumen, calculados con las solicitudes del profesional
function resumen(solicitudes: SolicitudResumen[]) {
  const enCurso = solicitudes.filter((s) =>
    ['en_coordinacion', 'agendado', 'presupuestado', 'contratado', 'reprogramacion'].includes(s.estadoServicio),
  )
  // Por cobrar: trabajos con presupuesto aceptado que todavía no se pagaron
  const porCobrar = solicitudes.filter((s) => (s.estadoServicio === 'contratado' || s.estadoServicio === 'agendado') && s.costoEstimado != null && !s.fechaPago)
  return {
    activas: enCurso.length,
    porCobrar: porCobrar.reduce((total, s) => total + (s.costoFinal ?? 0), 0),
    cantidadPorCobrar: porCobrar.length,
  }
}

interface DatoProps {
  icono: ReactElement
  titulo: string
  valor?: string
  detalle?: string
  // Contenido propio en vez de valor + detalle (ej: el medidor de la calificación)
  children?: ReactNode
  color: 'primary' | 'secondary' | 'warning'
  onClick: () => void
}

// Recuadro informativo del resumen (los de arriba del boceto)
function TarjetaDato({ icono, titulo, valor, detalle, children, color, onClick }: DatoProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
        textAlign: 'left',
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': { boxShadow: 2, borderColor: `${color}.main` },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: `${color}.main`, mb: 1 }}>
        {icono}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
      </Stack>
      {children ?? (
        <>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {valor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detalle}
          </Typography>
        </>
      )}
    </ButtonBase>
  )
}

// Pantalla principal del profesional
export default function InicioProfesional() {
  const navigate = useNavigate()
  const hoy = dayjs().format('YYYY-MM-DD')
  const [aAgendar, setAAgendar] = useState<SolicitudResumen | null>(null)
  const [aTomar, setATomar] = useState<UrgenteAAceptar | null>(null)
  const [aceptando, setAceptando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null)

  const solicitudes = useCarga('mis-solicitudes', traerMisSolicitudes)
  const urgentes = useCarga('urgentes', traerUrgentes, CADA_UN_MINUTO)
  const agendaHoy = useCarga(`hoy-${hoy}`, () => traerAgenda(hoy, hoy))
  const calificacion = useCarga('mi-calificacion', traerMiCalificacion)

  const datos = resumen(solicitudes.datos ?? [])
  // Las que aceptó y todavía no tienen fecha: vencen a las 48 h. Urgentes primero, después las más apuradas.
  // (La visita de una urgente no se agenda: es en el día, con la hora de llegada que dio al aceptarla)
  const pendientes = (solicitudes.datos ?? [])
    .filter((s) => s.estadoServicio === 'en_coordinacion' && !(s.urgente && s.costoEstimado == null))
    .sort((a, b) => Number(b.urgente) - Number(a.urgente) || horasQueQuedan(a) - horasQueQuedan(b))
  const error = solicitudes.error ?? agendaHoy.error ?? urgentes.error ?? calificacion.error
  // const medidor = useMedidorDeCarga(solicitudes.cargando || calificacion.cargando || agendaHoy.cargando)

  // Se acepta después de elegir en cuánto llega (TiempoLlegadaDialog)
  const aceptarUrgente = async (minutos: number) => {
    if (!aTomar) return
    setAceptando(true)
    try {
      await aceptarSolicitud(aTomar.idSolicitud, minutos)
      const llegada = dayjs().add(minutos, 'minute').format('HH:mm')
      setMensaje({ texto: `¡La tomaste! Le avisamos a ${aTomar.cliente} que llegás a las ${llegada}.`, tipo: 'success' })
    } catch (e) {
      // Ej: "Otro profesional ya tomó esta urgente"
      setMensaje({ texto: e instanceof Error ? e.message : 'No se pudo aceptar', tipo: 'error' })
    } finally {
      setAceptando(false)
      setATomar(null)
      urgentes.recargar()
      solicitudes.recargar()
      agendaHoy.recargar()
    }
  }

  // (Desactivado) Al entrar: el velocímetro de carga (5 s)
  // if (medidor.visible) return <MedidorCarga key={medidor.ronda} />

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {solicitudes.cargando || calificacion.cargando ? (
          [0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={112} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TarjetaDato
                icono={<AssignmentIcon />}
                titulo="Solicitudes activas"
                valor={String(datos.activas)}
                detalle="Agendadas, presupuestadas o contratadas"
                color="primary"
                onClick={() => navigate('/app/solicitudes')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TarjetaDato
                icono={<RequestQuoteIcon />}
                titulo="Cobros pendientes"
                valor={pesos.format(datos.porCobrar)}
                detalle={`${datos.cantidadPorCobrar} trabajo${datos.cantidadPorCobrar === 1 ? '' : 's'} aceptado${datos.cantidadPorCobrar === 1 ? '' : 's'} sin pagar`}
                color="secondary"
                onClick={() => navigate('/app/cobros')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TarjetaDato
                icono={<StarIcon />}
                titulo="Tu calificación"
                color="warning"
                onClick={() => navigate('/app/perfil')}
              >
                <MedidorCalificacion
                  promedio={calificacion.datos?.promedio ?? null}
                  cantidad={calificacion.datos?.cantidad ?? 0}
                />
              </TarjetaDato>
            </Grid>
          </>
        )}
      </Grid>

      {/* Urgencias: solo si hay */}
      <UrgenciasCerca
        urgentes={urgentes.datos ?? []}
        onTomar={(u) => setATomar({ idSolicitud: u.idSolicitud, cliente: u.cliente, descripcionProblema: u.descripcionProblema })}
      />

      <Grid container spacing={2}>
        {/* Pendientes de fecha */}
        <Grid size={{ xs: 12, md: 5 }}>
          <SeccionTarjeta
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
                            {s.urgente && 'Urgente · '}
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
          </SeccionTarjeta>
        </Grid>

        {/* Hoy */}
        <Grid size={{ xs: 12, md: 7 }}>
          <SeccionTarjeta
            titulo="Hoy"
            extra={
              <Button component={RouterLink} to="/app/agenda" size="small">
                Ver agenda
              </Button>
            }
          >
            <ListaDeEventos
              eventos={agendaHoy.datos ?? []}
              cargando={agendaHoy.cargando}
              vacio="No tenés visitas ni trabajos para hoy."
            />
          </SeccionTarjeta>
        </Grid>
      </Grid>

      {/* El profesional no tiene pestaña de Ayuda: el link va al pie de su inicio */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button startIcon={<HelpCenterIcon />} onClick={() => navigate('/app/ayuda')}>
          Ayuda y preguntas frecuentes
        </Button>
      </Box>

      <TiempoLlegadaDialog urgente={aTomar} cargando={aceptando} onClose={() => setATomar(null)} onConfirmar={aceptarUrgente} />

      <AgendarDialog
        solicitud={aAgendar}
        onClose={() => setAAgendar(null)}
        onAgendado={() => {
          solicitudes.recargar()
          agendaHoy.recargar()
        }}
      />

      <Snackbar
        open={mensaje !== null}
        autoHideDuration={5000}
        onClose={() => setMensaje(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {mensaje ? (
          <Alert severity={mensaje.tipo} variant="filled" onClose={() => setMensaje(null)}>
            {mensaje.texto}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}