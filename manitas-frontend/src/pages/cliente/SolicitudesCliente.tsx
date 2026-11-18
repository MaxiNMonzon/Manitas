import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import BoltIcon from '@mui/icons-material/Bolt'
import RefreshIcon from '@mui/icons-material/Refresh'
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
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import UrgenteDialog from '../../components/solicitudes/UrgenteDialog'
import DetalleSolicitudClienteDialog from '../../components/solicitudes/DetalleSolicitudClienteDialog'
import AceptarPresupuestoDialog from '../../components/solicitudes/AceptarPresupuestoDialog'
import CalificarDialog from '../../components/solicitudes/CalificarDialog'
import ReprogramarDialog from '../../components/solicitudes/ReprogramarDialog'
import ListaSolicitudes from '../../components/solicitudes/cliente/ListaSolicitudes'
import AccionesSolicitud from '../../components/solicitudes/cliente/AccionesSolicitud'
import ConfirmarDialog from '../../components/ConfirmarDialog'
import { useVueltaDeMercadoPago } from '../../components/solicitudes/cliente/useVueltaDeMercadoPago'
import { accionesDelDetalle, confirmacionCancelar, confirmacionRechazarPresupuesto, type Confirmacion } from '../../components/solicitudes/cliente/acciones'
import { cuantasEsperanRespuesta, delGrupo, ordenar, pestañas } from '../../components/solicitudes/cliente/ordenSolicitudes'
import type { GrupoCliente } from '../../components/solicitudes/estadosCliente'
import type { SolicitudResumen } from '../../types'

// Pestaña "Solicitudes" del cliente (boceto "Mis solicitudes").
// Esta página solo coordina: trae los datos, decide qué pestaña y qué diálogo están abiertos y responde.
// El orden está en ordenSolicitudes.ts, qué acciones hay en acciones.ts, la lista en ListaSolicitudes
// y la vuelta de Mercado Pago en useVueltaDeMercadoPago.
export default function SolicitudesCliente() {
  const navigate = useNavigate()

  // Datos del back
  const solicitudes = useCarga('solicitudes-cliente', traerSolicitudesCliente)
  const ubicacion = useCarga('ubicacion-cliente', traerUbicacionCliente)
  const especialidades = useCarga('especialidades', traerEspecialidades)

  // Al llegar después de pedir un presupuesto o una urgencia (ver Profesionales), viene el aviso en el state.
  // También puede venir de una novedad del Inicio ("Ver"): se abre esa solicitud
  const { state } = useLocation() as { state: { mensaje?: string; abrir?: number } | null }

  // Qué se está viendo. Del detalle se guarda el id (no la solicitud) para que se actualice al recargar
  const [grupo, setGrupo] = useState<GrupoCliente>('en_curso')
  const [idDetalle, setIdDetalle] = useState<number | null>(state?.abrir ?? null)

  // Diálogos abiertos (null = cerrado)
  const [aAceptar, setAAceptar] = useState<SolicitudResumen | null>(null)
  const [aCalificar, setACalificar] = useState<SolicitudResumen | null>(null)
  const [aReprogramar, setAReprogramar] = useState<SolicitudResumen | null>(null)
  const [urgenteAbierto, setUrgenteAbierto] = useState(false)
  // Cancelar o rechazar: antes se confirma
  const [aConfirmar, setAConfirmar] = useState<(Confirmacion & { accion: () => Promise<void> }) | null>(null)

  // Respuesta en curso y aviso del resultado
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<Aviso | null>(
    state?.mensaje ? { texto: state.mensaje, tipo: 'success' } : null,
  )

  const avisar = (texto: string, tipo: Aviso['tipo'] = 'success') => setMensaje({ texto, tipo })

  const confirmandoPago = useVueltaDeMercadoPago({
    onPagado: (s) => {
      avisar(s.estadoServicio === 'finalizado' ? '¡Pagado! El trabajo quedó finalizado. Ya podés calificar al profesional.' : '¡Pagado! La visita quedó paga.')
      setGrupo('completadas')
    },
    onError: (texto) => avisar(texto, 'warning'),
    // Se abre la solicitud que se intentó pagar, ya actualizada
    onTerminado: (id) => {
      setIdDetalle(id)
      solicitudes.recargar()
    },
  })

  const todas = solicitudes.datos ?? []
  const detalle = todas.find((s) => s.idSolicitud === idDetalle) ?? null
  const lista = ordenar(grupo, delGrupo(todas, grupo))
  const pestaña = pestañas.find((p) => p.valor === grupo)!
  const esperandoRespuesta = cuantasEsperanRespuesta(todas)

  // En una reprogramación, el horario nuevo sale del detalle de la solicitud
  const enReprogramacion = detalle?.estadoServicio === 'reprogramacion' ? detalle.idSolicitud : null
  const propuesta = useCarga(`propuesta-${enReprogramacion}`, () =>
    enReprogramacion ? traerHorarioPropuesto(enReprogramacion) : Promise.resolve(null),
  )

  // Después de responder algo: se cierra el detalle y se vuelve a traer la lista
  const terminar = (texto: string) => {
    avisar(texto)
    setIdDetalle(null)
    solicitudes.recargar()
  }

  // Manda una respuesta al back, avisa cómo salió, cierra el detalle y recarga la lista
  const responder = async (accion: () => Promise<void>, ok: string) => {
    setAConfirmar(null)
    setEnviando(true)
    try {
      await accion()
      avisar(ok)
      setIdDetalle(null)
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo hacer', 'error')
    } finally {
      setEnviando(false)
      solicitudes.recargar()
    }
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
        <Tabs value={grupo} onChange={(_, valor: GrupoCliente) => setGrupo(valor)} variant="fullWidth">
          {pestañas.map((p) => {
            const cantidad = delGrupo(todas, p.valor).length
            return <Tab key={p.valor} value={p.valor} label={p.valor === 'en_curso' && cantidad > 0 ? `${p.label} (${cantidad})` : p.label} />
          })}
        </Tabs>
      </Paper>

      <ListaSolicitudes
        // Al cambiar de pestaña, la lista arranca de cero (de a 5)
        key={grupo}
        lista={lista}
        cargando={solicitudes.cargando}
        vacio={pestaña.vacio}
        direccion={ubicacion.datos?.direccion ?? null}
        onVerDetalles={(s) => setIdDetalle(s.idSolicitud)}
      />

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
        onClose={() => setIdDetalle(null)}
        acciones={
          detalle &&
          accionesDelDetalle(detalle).length > 0 && (
            <AccionesSolicitud
              solicitud={detalle}
              ocupado={enviando}
              onCancelar={() => setAConfirmar({ ...confirmacionCancelar(detalle), accion: () => cancelarSolicitud(detalle.idSolicitud) })}
              onRechazarPresupuesto={() =>
                setAConfirmar({ ...confirmacionRechazarPresupuesto(detalle), accion: () => rechazarPresupuesto(detalle.idSolicitud) })
              }
              onAceptarPresupuesto={() => setAAceptar(detalle)}
              onReprogramar={() => setAReprogramar(detalle)}
              onAceptarHorario={() => responder(() => responderReprogramacion(detalle.idSolicitud, true), 'Horario nuevo confirmado.')}
              onCalificar={() => setACalificar(detalle)}
            />
          )
        }
      />
      <AceptarPresupuestoDialog solicitud={aAceptar} onClose={() => setAAceptar(null)} onAceptado={terminar} />
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
      <CalificarDialog solicitud={aCalificar} onClose={() => setACalificar(null)} onCalificado={() => terminar('¡Gracias por calificar!')} />
      <ConfirmarDialog
        abierto={aConfirmar !== null}
        titulo={aConfirmar?.titulo ?? ''}
        texto={aConfirmar?.texto ?? ''}
        boton={aConfirmar?.boton ?? ''}
        onClose={() => setAConfirmar(null)}
        onConfirmar={() => aConfirmar && responder(aConfirmar.accion, aConfirmar.ok)}
      />

      {/* 10 s: el de "solicitud enviada" trae el plazo que tiene el profesional y hay que poder leerlo */}
      <AvisoFlotante aviso={mensaje} onClose={() => setMensaje(null)} duracion={10000} />
    </>
  )
}
