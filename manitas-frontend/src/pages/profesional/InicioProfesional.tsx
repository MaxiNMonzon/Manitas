import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import dayjs from 'dayjs'
import { aceptarSolicitud, traerAgenda, traerMiCalificacion, traerMisSolicitudes, traerUrgentes } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import UrgenciasCerca from '../../components/solicitudes/UrgenciasCerca'
import SolicitudesNuevas from '../../components/solicitudes/SolicitudesNuevas'
import NovedadesInicio from '../../components/NovedadesInicio'
import ResumenProfesional from '../../components/inicio/ResumenProfesional'
import AgendaInicio from '../../components/inicio/AgendaInicio'
import TiempoLlegadaDialog, { type UrgenteAAceptar } from '../../components/solicitudes/TiempoLlegadaDialog'

const CADA_UN_MINUTO = 60 * 1000 // las urgentes vencen en 1 hora: se revisan seguido

// Pantalla principal del profesional: resumen, urgencias cerca, solicitudes nuevas, novedades y su agenda.
// Esta página solo trae los datos y acepta urgencias: cada parte está en components/inicio y components/solicitudes
export default function InicioProfesional() {
  const navigate = useNavigate()
  const hoy = dayjs().format('YYYY-MM-DD')
  const [aTomar, setATomar] = useState<UrgenteAAceptar | null>(null)
  const [aceptando, setAceptando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const solicitudes = useCarga('mis-solicitudes', traerMisSolicitudes)
  const urgentes = useCarga('urgentes', traerUrgentes, CADA_UN_MINUTO)
  const calificacion = useCarga('mi-calificacion', traerMiCalificacion)
  const agendaHoy = useCarga(`hoy-${hoy}`, () => traerAgenda(hoy, hoy))
  // Si hoy no tiene nada, se muestran las próximas (de los próximos 30 días) para que el inicio no quede vacío
  const proximos = useCarga(`proximos-${hoy}`, () => traerAgenda(dayjs().add(1, 'day').format('YYYY-MM-DD'), dayjs().add(30, 'day').format('YYYY-MM-DD')))

  // Las nuevas que tiene que responder: las que vencen antes, primero
  const nuevas = (solicitudes.datos ?? [])
    .filter((s) => s.estadoServicio === 'solicitado')
    .sort((a, b) => new Date(a.fechaCambioEstado).getTime() - new Date(b.fechaCambioEstado).getTime())
  const error = solicitudes.error ?? agendaHoy.error ?? urgentes.error ?? calificacion.error

  // Se acepta después de elegir en cuánto llega (TiempoLlegadaDialog)
  const aceptarUrgente = async (minutos: number) => {
    if (!aTomar) return
    setAceptando(true)
    try {
      await aceptarSolicitud(aTomar.idSolicitud, minutos)
      const llegada = dayjs().add(minutos, 'minute').format('HH:mm')
      setAviso({ texto: `¡La tomaste! Le avisamos a ${aTomar.cliente} que llegás a las ${llegada}.`, tipo: 'success' })
    } catch (e) {
      // Ej: "Otro profesional ya tomó esta urgente"
      setAviso({ texto: e instanceof Error ? e.message : 'No se pudo aceptar', tipo: 'error' })
    } finally {
      setAceptando(false)
      setATomar(null)
      urgentes.recargar()
      solicitudes.recargar()
      agendaHoy.recargar()
      proximos.recargar()
    }
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ResumenProfesional
        solicitudes={solicitudes.datos ?? []}
        calificacion={calificacion.datos ?? null}
        cargando={solicitudes.cargando || calificacion.cargando}
      />

      {/* Urgencias: solo si hay */}
      <UrgenciasCerca
        urgentes={urgentes.datos ?? []}
        onTomar={(u) => setATomar({ idSolicitud: u.idSolicitud, cliente: u.cliente, descripcionProblema: u.descripcionProblema })}
      />

      {/* Solicitudes nuevas: solo si hay */}
      <SolicitudesNuevas solicitudes={nuevas} onResponder={(s) => navigate('/app/solicitudes', { state: { abrir: s.idSolicitud } })} />

      {/* Lo que cambió por algo que hizo el cliente (aceptó el presupuesto, pagó...): solo si hay */}
      <NovedadesInicio rol="profesional" />

      <AgendaInicio
        hoy={{ eventos: agendaHoy.datos ?? [], cargando: agendaHoy.cargando }}
        proximos={{ eventos: proximos.datos ?? [], cargando: proximos.cargando }}
      />

      <TiempoLlegadaDialog urgente={aTomar} cargando={aceptando} onClose={() => setATomar(null)} onConfirmar={aceptarUrgente} />
      <AvisoFlotante aviso={aviso} onClose={() => setAviso(null)} />
    </>
  )
}
