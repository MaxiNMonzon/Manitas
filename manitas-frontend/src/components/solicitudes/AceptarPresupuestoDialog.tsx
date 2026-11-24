import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { aceptarPresupuesto } from '../../api/solicitudes'
import SelectorTurno from '../agenda/SelectorTurno'
import { formatoPesos } from '../../dinero'
import type { SolicitudResumen } from '../../types'

interface Props {
  solicitud: SolicitudResumen | null
  onClose: () => void
  onAceptado: (mensaje: string) => void
}

// Confirmar el servicio (PATCH /:id/aceptar-presupuesto): se hace en el momento, en la visita
// (si lleva hasta 1 hora), o se elige desde qué turno libre del profesional arranca
export default function AceptarPresupuestoDialog({ solicitud, onClose, onAceptado }: Props) {
  // Si ya tenía fecha de trabajo, es un cambio de precio a mitad del trabajo: solo se confirma
  const soloConfirmar = !!solicitud?.fechaInicio
  const entraEnLaVisita = solicitud?.horasTrabajo == null || solicitud.horasTrabajo <= 1
  const [modo, setModo] = useState<'momento' | 'turno'>('turno')
  const [inicio, setInicio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setModo('turno')
    setInicio(null)
    setError(null)
    onClose()
  }

  const confirmar = async () => {
    if (!solicitud) return
    const enElMomento = !soloConfirmar && modo === 'momento'
    setEnviando(true)
    setError(null)
    try {
      await aceptarPresupuesto(solicitud.idSolicitud, soloConfirmar || enElMomento ? null : new Date(inicio!))
      cerrar()
      onAceptado(
        soloConfirmar
          ? 'Aceptaste el nuevo precio.'
          : enElMomento
            ? 'Servicio confirmado: el profesional hace el trabajo ahora.'
            : `Servicio confirmado para el ${dayjs(inicio).format('dddd DD/MM [a las] HH:mm')}.`,
      )
    } catch (fallo) {
      // Ej: "No entran las horas seguidas desde ese horario (el próximo inicio posible es ...)"
      setError(fallo instanceof Error ? fallo.message : 'No se pudo confirmar')
    } finally {
      setEnviando(false)
    }
  }

  const listo = soloConfirmar || (modo === 'momento' ? entraEnLaVisita : inicio !== null)

  return (
    <Dialog open={solicitud !== null} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>{soloConfirmar ? 'Aceptar el nuevo precio' : 'Confirmar el servicio'}</DialogTitle>
      <DialogContent>
        {solicitud && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {solicitud.profesional ? `${solicitud.profesional.nombre} ${solicitud.profesional.apellido} · ` : ''}
              {solicitud.descripcionProblema}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {formatoPesos(solicitud.costoFinal)}
            </Typography>
            {solicitud.horasTrabajo != null && (
              <Typography variant="body2" color="text.secondary">
                Lleva {solicitud.horasTrabajo} {solicitud.horasTrabajo === 1 ? 'hora' : 'horas'} de trabajo
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {soloConfirmar ? (
          <Typography>El trabajo sigue con el mismo horario; solo cambia el precio.</Typography>
        ) : (
          <>
            <RadioGroup value={modo} onChange={(evento) => setModo(evento.target.value as 'momento' | 'turno')} sx={{ mb: 1 }}>
              <FormControlLabel value="turno" control={<Radio />} label="Elegir cuándo arranca" />
              <FormControlLabel
                value="momento"
                control={<Radio />}
                disabled={!entraEnLaVisita}
                label={entraEnLaVisita ? 'Ahora, en la visita' : 'Ahora, en la visita (lleva más de 1 hora)'}
              />
            </RadioGroup>
            {modo === 'turno' && solicitud && (
              <SelectorTurno
                idProfesional={solicitud.profesional?.idUsuario ?? null}
                valor={inicio}
                onChange={setInicio}
                etiquetaHora="Hora de inicio (se reservan las horas seguidas)"
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar}>Volver</Button>
        <Button variant="contained" color="success" onClick={confirmar} disabled={!listo} loading={enviando}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}