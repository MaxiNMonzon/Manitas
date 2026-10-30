import { useEffect, useRef, useState } from 'react'
import LinearProgress from '@mui/material/LinearProgress'
import { confirmarPagoMercadoPago } from '../../api/pagos'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import StarIcon from '@mui/icons-material/Star'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import {
  cancelarSolicitud,
  rechazarPresupuesto,
  reprogramarComoCliente,
  responderReprogramacion,
  traerHorarioPropuesto,
  traerSolicitudesCliente,
} from '../../api/solicitudes'
import { traerUbicacionCliente } from '../../api/perfil'
import { traerEspecialidades } from '../../api/profesionales'
import UrgenteDialog from '../../components/solicitudes/UrgenteDialog'
import BoltIcon from '@mui/icons-material/Bolt'
import { useCarga } from '../../hooks/useCarga'
import TarjetaSolicitudCliente from '../../components/solicitudes/TarjetaSolicitudCliente'
import DetalleSolicitudClienteDialog from '../../components/solicitudes/DetalleSolicitudClienteDialog'
import AceptarPresupuestoDialog from '../../components/solicitudes/AceptarPresupuestoDialog'
import CalificarDialog from '../../components/solicitudes/CalificarDialog'
import CheckoutButton from '../../components/pagos/CheckoutButton'
import ReprogramarDialog from '../../components/solicitudes/ReprogramarDialog'
import { puedeReprogramar } from '../../components/solicitudes/estados'
import { fechaClave, debePagar, grupoCliente, leTocaAlCliente, puedeCancelar, type GrupoCliente } from '../../components/solicitudes/estadosCliente'
import type { SolicitudResumen } from '../../types'

const POR_PAGINA = 5

const pestañas: { valor: GrupoCliente; label: string; vacio: string }[] = [
  { valor: 'en_curso', label: 'En curso', vacio: 'No tenés solicitudes en curso. Buscá un profesional y pedile un presupuesto.' },
  { valor: 'completadas', label: 'Completadas', vacio: 'Todavía no tenés solicitudes terminadas.' },
]

const tiempo = (fecha: string | null | undefined) => (fecha ? new Date(fecha).getTime() : 0)

// En curso: primero lo que espera una respuesta tuya, después las urgentes y el resto por fecha (lo más próximo arriba).
// Completadas: lo más reciente arriba
function ordenar(grupo: GrupoCliente, lista: SolicitudResumen[]): SolicitudResumen[] {
  const copia = [...lista]
  if (grupo === 'en_curso') {
    return copia.sort(
      (a, b) =>
        Number(leTocaAlCliente(b)) - Number(leTocaAlCliente(a)) ||
        Number(b.urgente) - Number(a.urgente) ||
        (tiempo(fechaClave(a)?.fecha) || Infinity) - (tiempo(fechaClave(b)?.fecha) || Infinity) ||
        tiempo(b.fechaCambioEstado) - tiempo(a.fechaCambioEstado),
    )
  }
  return copia.sort(
    (a, b) => tiempo(b.fechaFinReal ?? b.fechaCambioEstado) - tiempo(a.fechaFinReal ?? a.fechaCambioEstado),
  )
}

// Una acción que hay que confirmar antes (no se puede deshacer)
interface Confirmacion {
  titulo: string
  texto: string
  boton: string
  accion: () => Promise<void>
  ok: string
}

// Pestaña "Solicitudes" del cliente (boceto "Mis solicitudes")
export default function SolicitudesCliente() {
  const navigate = useNavigate()
  // Al tocar "Volver al sitio" en Mercado Pago se vuelve acá con ?payment_id=...&status=...&external_reference=<idSolicitud>
  const [params, setParams] = useSearchParams()
  const vueltaDePago = params.get('payment_id') || params.get('status') ? Number(params.get('external_reference')) || null : null
  const [grupo, setGrupo] = useState<GrupoCliente>('en_curso')
  const [cantidadVisible, setCantidadVisible] = useState(POR_PAGINA)
  const [confirmandoPago, setConfirmandoPago] = useState(vueltaDePago !== null)
  const pagoProcesado = useRef(false)
  const [aAceptar, setAAceptar] = useState<SolicitudResumen | null>(null)
  const [aCalificar, setACalificar] = useState<SolicitudResumen | null>(null)
  const [aReprogramar, setAReprogramar] = useState<SolicitudResumen | null>(null)
  const [urgenteAbierto, setUrgenteAbierto] = useState(false)
  const especialidades = useCarga('especialidades', traerEspecialidades)
  const [aConfirmar, setAConfirmar] = useState<Confirmacion | null>(null)
  const [enviando, setEnviando] = useState(false)
  // Al llegar después de pedir un presupuesto o una urgencia (ver Profesionales), viene el aviso en el state
  // También puede venir de una novedad del Inicio ("Ver"): se abre esa solicitud
  const { state } = useLocation() as { state: { mensaje?: string; abrir?: number } | null }
  // Se guarda el id (no la solicitud) para que el detalle se actualice al recargar (ej: después de pagar)
  const [idDetalle, setIdDetalle] = useState<number | null>(state?.abrir ?? null)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' | 'warning' } | null>(
    state?.mensaje ? { texto: state.mensaje, tipo: 'success' } : null,
  )

  const solicitudes = useCarga('solicitudes-cliente', traerSolicitudesCliente)
  const detalle = solicitudes.datos?.find((s) => s.idSolicitud === idDetalle) ?? null
  const setDetalle = (s: SolicitudResumen | null) => setIdDetalle(s?.idSolicitud ?? null)
  const recargarSolicitudes = solicitudes.recargar

  // Vuelta de Mercado Pago: no alcanza con el "status" de la dirección (se puede cambiar a mano), así que
  // el back le pregunta a Mercado Pago si el pago se aprobó y recién ahí marca la solicitud como pagada.
  // Después se sacan los datos del pago de la dirección y se abre la solicitud, ya pagada
  useEffect(() => {
    if (vueltaDePago === null || pagoProcesado.current) return
    // En desarrollo React ejecuta el efecto dos veces: se confirma una sola
    pagoProcesado.current = true
    const paymentId = params.get('payment_id')
    const status = params.get('status')
    const confirmar =
      !paymentId || paymentId === 'null' || status !== 'approved'
        ? Promise.reject(
            new Error(status === 'rejected' ? 'Mercado Pago rechazó el pago. Podés intentarlo de nuevo.' : 'No se completó el pago. Podés intentarlo de nuevo.'),
          )
        : confirmarPagoMercadoPago(paymentId)
    confirmar
      .then((s) => {
        setMensaje({
          texto: s.estadoServicio === 'finalizado' ? '¡Pagado! El trabajo quedó finalizado. Ya podés calificar al profesional.' : '¡Pagado! La visita quedó paga.',
          tipo: 'success',
        })
        setGrupo('completadas')
      })
      .catch((e: Error) => setMensaje({ texto: e.message, tipo: 'warning' }))
      .finally(() => {
        setIdDetalle(vueltaDePago)
        setConfirmandoPago(false)
        setParams({}, { replace: true })
        recargarSolicitudes()
      })
  }, [vueltaDePago, params, setParams, recargarSolicitudes])
  const ubicacion = useCarga('ubicacion-cliente', traerUbicacionCliente)
  // En una reprogramación, el horario nuevo sale del detalle de la solicitud
  const enReprogramacion = detalle?.estadoServicio === 'reprogramacion' ? detalle.idSolicitud : null
  const propuesta = useCarga(`propuesta-${enReprogramacion}`, () =>
    enReprogramacion ? traerHorarioPropuesto(enReprogramacion) : Promise.resolve(null),
  )

  const todas = solicitudes.datos ?? []
  const delGrupo = (g: GrupoCliente) => todas.filter((s) => grupoCliente(s.estadoServicio) === g)
  const lista = ordenar(grupo, delGrupo(grupo))
  const pestaña = pestañas.find((p) => p.valor === grupo)!
  const esperandoRespuesta = delGrupo('en_curso').filter(leTocaAlCliente).length

  const avisar = (texto: string, tipo: 'success' | 'error' = 'success') => setMensaje({ texto, tipo })

  const ejecutar = async (accion: () => Promise<void>, ok: string) => {
    setAConfirmar(null)
    setEnviando(true)
    try {
      await accion()
      avisar(ok)
      setDetalle(null)
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo hacer', 'error')
    } finally {
      setEnviando(false)
      solicitudes.recargar()
    }
  }

  // Los botones del detalle según el estado y lo que le toca al cliente
  const accionesDe = (s: SolicitudResumen) => {
    const botones = []
    const nombre = s.profesional?.nombre ?? 'el profesional'

    if (puedeCancelar(s)) {
      botones.push(
        <Button
          key="cancelar"
          color="error"
          disabled={enviando}
          onClick={() =>
            setAConfirmar({
              titulo: '¿Cancelar la solicitud?',
              texto:
                s.estadoServicio === 'solicitado'
                  ? 'La solicitud se cancela y se libera el horario que habías elegido.'
                  : `Le avisamos a ${nombre} y se liberan los horarios reservados. No se puede deshacer.`,
              boton: 'Cancelar solicitud',
              accion: () => cancelarSolicitud(s.idSolicitud),
              ok: 'Solicitud cancelada.',
            })
          }
          sx={{ mr: 'auto' }}
        >
          Cancelar solicitud
        </Button>,
      )
    }

    if (s.estadoServicio === 'presupuestado') {
      botones.push(
        <Button
          key="rechazar-presupuesto"
          variant="outlined"
          color="error"
          disabled={enviando}
          onClick={() =>
            setAConfirmar({
              titulo: '¿Rechazar el presupuesto?',
              texto: s.costoVisita
                ? `La solicitud termina acá. Igual queda por pagar la visita de ${nombre}.`
                : 'La solicitud termina acá y no se puede deshacer.',
              boton: 'Rechazar',
              accion: () => rechazarPresupuesto(s.idSolicitud),
              ok: 'Presupuesto rechazado.',
            })
          }
        >
          Rechazar
        </Button>,
        <Button key="aceptar-presupuesto" variant="contained" color="success" onClick={() => setAAceptar(s)}>
          Aceptar presupuesto
        </Button>,
      )
    }

    // Proponer otro horario (o una contrapropuesta al del profesional)
    if (puedeReprogramar(s, 'cliente') && s.profesional) {
      botones.push(
        <Button key="reprogramar" startIcon={<EventRepeatIcon />} disabled={enviando} onClick={() => setAReprogramar(s)}>
          {s.estadoServicio === 'reprogramacion' ? 'Proponer otro' : 'Cambiar horario'}
        </Button>,
      )
    }

    if (s.estadoServicio === 'reprogramacion' && s.propuestaDe === 'profesional') {
      botones.push(
        <Button
          key="aceptar-horario"
          variant="contained"
          color="success"
          loading={enviando}
          onClick={() =>
            ejecutar(() => responderReprogramacion(s.idSolicitud, true), 'Horario nuevo confirmado.')
          }
        >
          Aceptar horario
        </Button>,
      )
    }

    if (debePagar(s)) {
      botones.push(
        // Va a Mercado Pago; al tocar "Volver al sitio" se confirma el pago y vuelve acá (ver ResultadoPago)
        <CheckoutButton key="pagar" idSolicitud={s.idSolicitud} />,
      )
    }

    if (s.estadoServicio === 'finalizado' && s.calificacionServicio == null) {
      botones.push(
        <Button key="calificar" variant="contained" startIcon={<StarIcon />} onClick={() => setACalificar(s)}>
          Calificar
        </Button>,
      )
    }

    return botones.length ? botones : null
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

      {confirmandoPago && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Confirmando el pago con Mercado Pago…
          <LinearProgress sx={{ mt: 1 }} />
        </Alert>
      )}

      {solicitudes.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {solicitudes.error}
        </Alert>
      )}

      {esperandoRespuesta > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {esperandoRespuesta === 1 ? 'Hay 1 solicitud esperando tu respuesta.' : `Hay ${esperandoRespuesta} solicitudes esperando tu respuesta.`}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={grupo}
          onChange={(_, valor: GrupoCliente) => {
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
                label={p.valor === 'en_curso' && cantidad > 0 ? `${p.label} (${cantidad})` : p.label}
              />
            )
          })}
        </Tabs>
      </Paper>

      {solicitudes.cargando ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </Stack>
      ) : lista.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{pestaña.vacio}</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {lista.slice(0, cantidadVisible).map((s) => (
            <TarjetaSolicitudCliente
              key={s.idSolicitud}
              solicitud={s}
              direccion={ubicacion.datos?.direccion ?? null}
              onVerDetalles={() => setDetalle(s)}
            />
          ))}
        </Stack>
      )}

      {lista.length > cantidadVisible && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setCantidadVisible((c) => c + POR_PAGINA)}>Ver más ({lista.length - cantidadVisible})</Button>
        </Box>
      )}

      {/* Como en el boceto: pedir otra, al pie de la lista. Se elige el profesional en el buscador;
          una urgencia no elige profesional: le llega a todos los de la zona */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center', mt: 3 }}>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => navigate('/app/profesionales')}>
          Nueva solicitud
        </Button>
        <Button variant="outlined" color="error" size="large" startIcon={<BoltIcon />} onClick={() => setUrgenteAbierto(true)}>
          Es urgente
        </Button>
      </Stack>
      <UrgenteDialog
        key={String(urgenteAbierto)}
        abierto={urgenteAbierto}
        especialidades={especialidades.datos ?? []}
        onClose={() => setUrgenteAbierto(false)}
        onCreada={(texto) => {
          avisar(texto)
          setGrupo('en_curso')
          solicitudes.recargar()
        }}
      />

      <DetalleSolicitudClienteDialog
        solicitud={detalle}
        direccion={ubicacion.datos?.direccion ?? null}
        horarioPropuesto={propuesta.datos}
        onClose={() => setDetalle(null)}
        acciones={detalle && accionesDe(detalle)}
      />
      <AceptarPresupuestoDialog
        solicitud={aAceptar}
        onClose={() => setAAceptar(null)}
        onAceptado={(texto) => {
          avisar(texto)
          setDetalle(null)
          solicitudes.recargar()
        }}
      />
      <ReprogramarDialog
        solicitud={aReprogramar}
        idProfesional={aReprogramar?.profesional?.idUsuario ?? null}
        conQuien={aReprogramar?.profesional?.nombre ?? 'el profesional'}
        onClose={() => setAReprogramar(null)}
        enviar={(inicio) => reprogramarComoCliente(aReprogramar!.idSolicitud, inicio)}
        onEnviado={() => {
          avisar('Horario propuesto. Te avisamos cuando el profesional conteste.')
          solicitudes.recargar()
        }}
      />
      <CalificarDialog
        solicitud={aCalificar}
        onClose={() => setACalificar(null)}
        onCalificado={() => {
          avisar('¡Gracias por calificar!')
          setDetalle(null)
          solicitudes.recargar()
        }}
      />

      {/* Confirmar antes de cancelar o rechazar (no se puede deshacer) */}
      <Dialog open={aConfirmar !== null} onClose={() => setAConfirmar(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{aConfirmar?.titulo}</DialogTitle>
        <DialogContent>
          <Typography>{aConfirmar?.texto}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAConfirmar(null)}>Volver</Button>
          <Button variant="contained" color="error" onClick={() => aConfirmar && ejecutar(aConfirmar.accion, aConfirmar.ok)}>
            {aConfirmar?.boton}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={mensaje !== null}
        // 10 s: el de "solicitud enviada" trae el plazo que tiene el profesional y hay que poder leerlo
        autoHideDuration={10000}
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
