import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import RefreshIcon from '@mui/icons-material/Refresh'
import dayjs from 'dayjs'
import {
  aceptarSolicitud,
  rechazarSolicitud,
  reprogramarComoProfesional,
  responderReprogramacionProfesional,
  traerHorarioPropuestoProfesional,
  traerMiIdProfesional,
  traerMisSolicitudes,
  traerUrgentes,
} from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import DetalleSolicitudDialog from '../../components/solicitudes/DetalleSolicitudDialog'
import PresupuestarDialog from '../../components/solicitudes/PresupuestarDialog'
import ReprogramarDialog from '../../components/solicitudes/ReprogramarDialog'
import TiempoLlegadaDialog from '../../components/solicitudes/TiempoLlegadaDialog'
import UrgenciasCerca from '../../components/solicitudes/UrgenciasCerca'
import { formatoFecha, type Grupo } from '../../components/solicitudes/estados'
import ListaSolicitudes from '../../components/solicitudes/profesional/ListaSolicitudes'
import RechazarSolicitudDialog from '../../components/solicitudes/profesional/RechazarSolicitudDialog'
import { AccionesDetalle, AccionTarjeta } from '../../components/solicitudes/profesional/AccionesSolicitud'
import { accionesDelDetalle } from '../../components/solicitudes/profesional/acciones'
import { delGrupo, ordenar, pestañas } from '../../components/solicitudes/profesional/ordenSolicitudes'
import type { SolicitudResumen } from '../../types'

// Lo que hace falta para tomar una urgencia (puede venir de la lista o del aviso de urgencias cerca)
interface Urgencia {
  idSolicitud: number
  cliente: string
  descripcionProblema: string
}

// Pestaña "Solicitudes" del profesional (boceto "Mis solicitudes").
// Esta página solo coordina: trae los datos, decide qué pestaña y qué diálogo están abiertos y responde.
// El orden y las carpetas están en ordenSolicitudes.ts, qué acciones hay en acciones.ts y la lista en ListaSolicitudes.
export default function SolicitudesProfesional() {
  // Datos del back
  const solicitudes = useCarga('mis-solicitudes', traerMisSolicitudes)
  // Urgencias cerca que nadie tomó (se revisan cada minuto): la primera que acepta se la queda
  const urgentes = useCarga('urgentes', traerUrgentes, 60 * 1000)
  // Para proponer otro horario hacen falta sus turnos libres (y el token no trae su id)
  const miId = useCarga('mi-id-profesional', traerMiIdProfesional)

  // Qué se está viendo
  const [grupo, setGrupo] = useState<Grupo>('nuevas')
  const [detalleElegido, setDetalleElegido] = useState<SolicitudResumen | null>(null)
  // La que viene del Inicio se abre una sola vez: después manda lo que elija el profesional
  const [desdeInicioUsada, setDesdeInicioUsada] = useState(false)

  // Diálogos abiertos (null = cerrado)
  const [aPresupuestar, setAPresupuestar] = useState<SolicitudResumen | null>(null)
  const [aRechazar, setARechazar] = useState<SolicitudResumen | null>(null)
  const [aReprogramar, setAReprogramar] = useState<SolicitudResumen | null>(null)
  // Urgente a aceptar: antes se elige en cuánto llega
  const [aTomar, setATomar] = useState<Urgencia | null>(null)

  // Respuesta en curso y aviso del resultado
  const [aceptando, setAceptando] = useState(false)
  const [mensaje, setMensaje] = useState<Aviso | null>(null)

  const setDetalle = (s: SolicitudResumen | null) => {
    setDesdeInicioUsada(true)
    setDetalleElegido(s)
  }

  // Si viene del Inicio ("Responder"), abre esa solicitud apenas carga la lista
  const { state } = useLocation() as { state: { abrir?: number } | null }
  const todas = solicitudes.datos ?? []
  const desdeInicio = !desdeInicioUsada && state?.abrir ? (todas.find((s) => s.idSolicitud === state.abrir) ?? null) : null
  const detalle = detalleElegido ?? desdeInicio

  // En una reprogramación, el horario nuevo sale del detalle de la solicitud
  const enReprogramacion = detalle?.estadoServicio === 'reprogramacion' ? detalle.idSolicitud : null
  const propuesta = useCarga(`propuesta-${enReprogramacion}`, () =>
    enReprogramacion ? traerHorarioPropuestoProfesional(enReprogramacion) : Promise.resolve(null),
  )

  const pestaña = pestañas.find((p) => p.valor === grupo)!
  const lista = ordenar(grupo, delGrupo(todas, grupo))

  const avisar = (texto: string) => setMensaje({ texto, tipo: 'success' })

  // Manda una respuesta al back, avisa cómo salió, cierra el detalle y recarga la lista
  const responder = async (accion: () => Promise<void>, ok: string) => {
    setAceptando(true)
    try {
      await accion()
      avisar(ok)
      setDetalle(null)
    } catch (e) {
      setMensaje({ texto: e instanceof Error ? e.message : 'No se pudo hacer', tipo: 'error' })
    } finally {
      setAceptando(false)
      solicitudes.recargar()
    }
  }

  const aceptar = (s: SolicitudResumen) =>
    // Una urgente es en el día: primero se elige en cuánto llega
    s.urgente
      ? setATomar({ idSolicitud: s.idSolicitud, cliente: s.cliente?.nombre ?? 'Cliente', descripcionProblema: s.descripcionProblema })
      : responder(
          () => aceptarSolicitud(s.idSolicitud),
          s.fechaVisita ? `Aceptada. La visita quedó confirmada para el ${formatoFecha(s.fechaVisita)}.` : 'Aceptada. La visita quedó confirmada.',
        )

  const responderHorario = (s: SolicitudResumen, acepta: boolean) =>
    responder(
      () => responderReprogramacionProfesional(s.idSolicitud, acepta),
      acepta ? 'Horario nuevo confirmado.' : 'Sigue el horario que tenían.',
    )

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
        <Tabs value={grupo} onChange={(_, valor: Grupo) => setGrupo(valor)} variant="fullWidth">
          {pestañas.map((p) => {
            const cantidad = delGrupo(todas, p.valor).length
            return <Tab key={p.valor} value={p.valor} label={p.valor !== 'historial' && cantidad > 0 ? `${p.label} (${cantidad})` : p.label} />
          })}
        </Tabs>
      </Paper>

      {/* En "Nuevas", arriba de todo, las urgencias cerca que puede tomar */}
      {grupo === 'nuevas' && <UrgenciasCerca urgentes={urgentes.datos ?? []} onTomar={setATomar} sx={{ mb: 2 }} />}

      <ListaSolicitudes
        // Al cambiar de pestaña, la lista arranca de cero (de a 5, con todas las carpetas abiertas)
        key={grupo}
        grupo={grupo}
        lista={lista}
        cargando={solicitudes.cargando}
        vacio={pestaña.vacio}
        onVerDetalles={setDetalle}
        accionDe={(s) => <AccionTarjeta solicitud={s} onPresupuestar={() => setAPresupuestar(s)} onResponderHorario={() => setDetalle(s)} />}
      />

      <DetalleSolicitudDialog
        solicitud={detalle}
        onClose={() => setDetalle(null)}
        horarioPropuesto={propuesta.datos}
        acciones={
          detalle &&
          accionesDelDetalle(detalle).length > 0 && (
            <AccionesDetalle
              solicitud={detalle}
              ocupado={aceptando}
              onReprogramar={() => setAReprogramar(detalle)}
              onRechazar={() => setARechazar(detalle)}
              onAceptar={() => aceptar(detalle)}
              onResponderHorario={(acepta) => responderHorario(detalle, acepta)}
              onPresupuestar={() => setAPresupuestar(detalle)}
            />
          )
        }
      />
      <ReprogramarDialog
        solicitud={aReprogramar}
        idProfesional={miId.datos}
        conQuien={aReprogramar?.cliente?.nombre ?? 'el cliente'}
        onClose={() => setAReprogramar(null)}
        enviar={(inicio) => reprogramarComoProfesional(aReprogramar!.idSolicitud, inicio)}
        onEnviado={() => {
          avisar('Horario propuesto. Te avisamos cuando el cliente conteste.')
          setDetalle(null)
          solicitudes.recargar()
        }}
      />
      <TiempoLlegadaDialog
        urgente={aTomar}
        cargando={aceptando}
        onClose={() => setATomar(null)}
        onConfirmar={(minutos) => {
          const u = aTomar!
          setATomar(null)
          responder(
            () => aceptarSolicitud(u.idSolicitud, minutos),
            `¡La tomaste! Le avisamos a ${u.cliente} que llegás a las ${dayjs().add(minutos, 'minute').format('HH:mm')}.`,
          ).then(urgentes.recargar)
        }}
      />
      <PresupuestarDialog
        solicitud={aPresupuestar}
        onClose={() => setAPresupuestar(null)}
        onEnviado={() => {
          // Se cierra también el detalle desde el que se mandó (ya no hay nada más que hacer ahí)
          setDetalle(null)
          avisar('Presupuesto enviado. El cliente lo acepta o lo rechaza desde su cuenta.')
          solicitudes.recargar()
        }}
      />
      <RechazarSolicitudDialog
        solicitud={aRechazar}
        onClose={() => setARechazar(null)}
        onConfirmar={(s) => {
          setARechazar(null)
          responder(() => rechazarSolicitud(s.idSolicitud), 'Solicitud rechazada.')
        }}
      />

      <AvisoFlotante aviso={mensaje} onClose={() => setMensaje(null)} />
    </>
  )
}
