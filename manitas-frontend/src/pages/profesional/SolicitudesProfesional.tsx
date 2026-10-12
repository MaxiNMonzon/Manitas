import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import RefreshIcon from '@mui/icons-material/Refresh'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import { aceptarSolicitud, rechazarSolicitud, traerMisSolicitudes } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import AgendarDialog from '../../components/agenda/AgendarDialog'
import TarjetaSolicitud from '../../components/solicitudes/TarjetaSolicitud'
import DetalleSolicitudDialog from '../../components/solicitudes/DetalleSolicitudDialog'
import PresupuestarDialog from '../../components/solicitudes/PresupuestarDialog'
import { fechaPrincipal, grupoDe, type Grupo } from '../../components/solicitudes/estados'
import GrupoCarpeta from '../../components/solicitudes/GrupoCarpeta'
import type { EstadoSolicitud, SolicitudResumen } from '../../types'

const POR_PAGINA = 5

const pestañas: { valor: Grupo; label: string; vacio: string }[] = [
  { valor: 'nuevas', label: 'Nuevas', vacio: 'No tenés solicitudes nuevas para responder.' },
  { valor: 'en_curso', label: 'En curso', vacio: 'No tenés trabajos en curso.' },
  { valor: 'historial', label: 'Historial', vacio: 'Todavía no tenés solicitudes terminadas.' },
]

const tiempo = (fecha: string | null | undefined) => (fecha ? new Date(fecha).getTime() : 0)

// Orden de cada pestaña: primero lo que más apura
function ordenar(grupo: Grupo, lista: SolicitudResumen[]): SolicitudResumen[] {
  const copia = [...lista]
  if (grupo === 'nuevas') {
    // Urgentes primero, después las más viejas (son las que vencen antes)
    return copia.sort((a, b) => Number(b.urgente) - Number(a.urgente) || tiempo(a.fechaCambioEstado) - tiempo(b.fechaCambioEstado))
  }
  if (grupo === 'en_curso') {
    // Primero las que hay que coordinar, después las agendadas por fecha, al final las presupuestadas
    const prioridad = { en_coordinacion: 0, agendado: 1, presupuestado: 2 } as Record<string, number>
    return copia.sort(
      (a, b) =>
        prioridad[a.estadoServicio] - prioridad[b.estadoServicio] ||
        tiempo(fechaPrincipal(a)?.fecha) - tiempo(fechaPrincipal(b)?.fecha) ||
        tiempo(a.fechaCambioEstado) - tiempo(b.fechaCambioEstado),
    )
  }
  // Historial: agrupadas por estado y, dentro de cada uno, lo más reciente arriba
  const ordenHistorial = ['finalizado', 'rechazado', 'cancelado', 'expirado']
  return copia.sort(
    (a, b) =>
      ordenHistorial.indexOf(a.estadoServicio) - ordenHistorial.indexOf(b.estadoServicio) ||
      tiempo(b.fechaFinReal ?? b.fechaCambioEstado) - tiempo(a.fechaFinReal ?? a.fechaCambioEstado),
  )
}

// Junta las solicitudes seguidas que tienen el mismo estado (la lista ya viene ordenada por estado)
function porEstado(lista: SolicitudResumen[]): { estado: EstadoSolicitud; items: SolicitudResumen[] }[] {
  const grupos: { estado: EstadoSolicitud; items: SolicitudResumen[] }[] = []
  for (const s of lista) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.estado === s.estadoServicio) ultimo.items.push(s)
    else grupos.push({ estado: s.estadoServicio, items: [s] })
  }
  return grupos
}

// Pestaña "Solicitudes" del profesional (boceto "Mis solicitudes")
export default function SolicitudesProfesional() {
  const [grupo, setGrupo] = useState<Grupo>('nuevas')
  // Carpetas cerradas por el usuario (al entrar están todas abiertas)
  const [cerradas, setCerradas] = useState<Set<EstadoSolicitud>>(new Set())
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)
  const [detalle, setDetalle] = useState<SolicitudResumen | null>(null)
  const [aAgendar, setAAgendar] = useState<SolicitudResumen | null>(null)
  const [aPresupuestar, setAPresupuestar] = useState<SolicitudResumen | null>(null)
  const [aRechazar, setARechazar] = useState<SolicitudResumen | null>(null)
  const [aceptando, setAceptando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null)

  const solicitudes = useCarga('mis-solicitudes', traerMisSolicitudes)
  const todas = solicitudes.datos ?? []
  const delGrupo = (g: Grupo) => todas.filter((s) => grupoDe(s.estadoServicio) === g)
  const lista = ordenar(grupo, delGrupo(grupo))
  const pestaña = pestañas.find((p) => p.valor === grupo)!

  // Aceptar o rechazar desde el detalle, con aviso del resultado
  const responder = async (accion: () => Promise<void>, ok: string) => {
    setAceptando(true)
    try {
      await accion()
      setMensaje({ texto: ok, tipo: 'success' })
      setDetalle(null)
    } catch (e) {
      setMensaje({ texto: e instanceof Error ? e.message : 'No se pudo hacer', tipo: 'error' })
    } finally {
      setAceptando(false)
      solicitudes.recargar()
    }
  }

  // En la tarjeta: el botón de la acción que le toca a cada estado. Las nuevas se responden en el detalle
  const accionesDe = (s: SolicitudResumen) => {
    if (s.estadoServicio === 'en_coordinacion') {
      return (
        <Button size="small" variant="contained" startIcon={<EventAvailableIcon />} onClick={() => setAAgendar(s)}>
          Agendar
        </Button>
      )
    }
    if (s.estadoServicio === 'agendado' && s.costoEstimado == null) {
      return (
        <Button size="small" variant="contained" color="secondary" startIcon={<RequestQuoteIcon />} onClick={() => setAPresupuestar(s)}>
          Enviar presupuesto
        </Button>
      )
    }
    return null
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Mis solicitudes
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={solicitudes.recargar}>
          Actualizar
        </Button>
      </Stack>

      {solicitudes.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {solicitudes.error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={grupo}
          onChange={(_, valor: Grupo) => {
            setGrupo(valor)
            setCantidadVisible(POR_PAGINA)
          }}
          variant="fullWidth"
        >
          {pestañas.map((p) => {
            const cantidad = delGrupo(p.valor).length
            return (
              <Tab
                key={p.valor}
                value={p.valor}
                label={p.valor !== 'historial' && cantidad > 0 ? `${p.label} (${cantidad})` : p.label}
              />
            )
          })}
        </Tabs>
      </Paper>

      {solicitudes.cargando ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </Stack>
      ) : lista.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{pestaña.vacio}</Typography>
        </Paper>
      ) : (
        // Una sola lista, con las del mismo estado juntas bajo un encabezado de su color
        <Stack spacing={1.5}>
          {porEstado(lista.slice(0, cantidadVisible)).map(({ estado, items }) => {
            const tarjetas = items.map((s) => (
              <TarjetaSolicitud
                key={s.idSolicitud}
                solicitud={s}
                onVerDetalles={() => setDetalle(s)}
                acciones={accionesDe(s)}
                // El estado ya lo dice la carpeta (o la pestaña, en Nuevas)
                mostrarEstado={false}
              />
            ))
            // En Nuevas hay un solo estado: no hace falta carpeta
            if (grupo === 'nuevas') return tarjetas
            return (
              <GrupoCarpeta
                key={estado}
                estado={estado}
                cantidad={lista.filter((s) => s.estadoServicio === estado).length}
                abierto={!cerradas.has(estado)}
                onAlternar={() =>
                  setCerradas((c) => {
                    const nuevas = new Set(c)
                    if (nuevas.has(estado)) nuevas.delete(estado)
                    else nuevas.add(estado)
                    return nuevas
                  })
                }
              >
                {tarjetas}
              </GrupoCarpeta>
            )
          })}
        </Stack>
      )}

      {lista.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((c) => c + POR_PAGINA)}>Ver más ({lista.length - cantidadVisible})</Button>
        </Box>
      )}

      <DetalleSolicitudDialog
        solicitud={detalle}
        onClose={() => setDetalle(null)}
        acciones={
          detalle?.estadoServicio === 'solicitado' && (
            <>
              <Button variant="outlined" color="error" onClick={() => setARechazar(detalle)} disabled={aceptando}>
                Rechazar
              </Button>
              <Button
                variant="contained"
                color="success"
                loading={aceptando}
                onClick={() =>
                  responder(
                    () => aceptarSolicitud(detalle.idSolicitud),
                    'Aceptada. Coordiná la visita con el cliente y cargá la fecha.',
                  )
                }
              >
                Aceptar
              </Button>
            </>
          )
        }
      />
      <AgendarDialog solicitud={aAgendar} onClose={() => setAAgendar(null)} onAgendado={solicitudes.recargar} />
      <PresupuestarDialog
        solicitud={aPresupuestar}
        onClose={() => setAPresupuestar(null)}
        onEnviado={() => {
          setMensaje({ texto: 'Presupuesto enviado. El cliente lo acepta o lo rechaza desde su cuenta.', tipo: 'success' })
          solicitudes.recargar()
        }}
      />

      {/* Confirmar antes de rechazar (no se puede deshacer) */}
      <Dialog open={aRechazar !== null} onClose={() => setARechazar(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Rechazar la solicitud?</DialogTitle>
        <DialogContent>
          <Typography>
            La solicitud de {aRechazar?.cliente?.nombre} queda rechazada y no se puede deshacer. Hacelo si no hacés ese
            trabajo o no podés tomarlo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setARechazar(null)}>Volver</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              const s = aRechazar!
              setARechazar(null)
              responder(() => rechazarSolicitud(s.idSolicitud), 'Solicitud rechazada.')
            }}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>

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
