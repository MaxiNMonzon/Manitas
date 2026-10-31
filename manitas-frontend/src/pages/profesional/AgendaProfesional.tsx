import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs, { type Dayjs } from 'dayjs'
import { traerAgenda } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
// MEDIDOR DE CARGA (desactivado, archivo local sin subir; ver NOTAS-SESION.md punto 23):
// import { useMedidorDeCarga } from '../../hooks/useMedidorDeCarga'
// import MedidorCarga from '../../components/MedidorCarga'
import CalendarioMensual from '../../components/agenda/CalendarioMensual'
import ListaDeEventos from '../../components/agenda/ListaDeEventos'
import SeccionTarjeta from '../../components/SeccionTarjeta'
import HorarioTrabajo from '../../components/agenda/HorarioTrabajo'

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

// Pestaña "Agenda" del profesional: calendario del mes + lo del día elegido
export default function AgendaProfesional() {
  const [mes, setMes] = useState<Dayjs>(dayjs().startOf('month'))
  const [diaElegido, setDiaElegido] = useState<Dayjs>(dayjs())

  const agendaMes = useCarga(`mes-${mes.format('YYYY-MM')}`, () =>
    traerAgenda(mes.startOf('month').format('YYYY-MM-DD'), mes.endOf('month').format('YYYY-MM-DD')),
  )

  // (Desactivado) Velocímetro de carga, solo al entrar: al cambiar de mes carga el calendario solo
  // const medidor = useMedidorDeCarga(agendaMes.cargando)

  // Lo del día elegido (incluye trabajos de varios días que pasan por ese día)
  const delDia = (agendaMes.datos ?? []).filter(
    (e) => dayjs(e.inicio).isBefore(diaElegido.endOf('day')) && dayjs(e.fin).isAfter(diaElegido.startOf('day')),
  )

  // if (medidor.visible) return <MedidorCarga key={medidor.ronda} />

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Agenda
      </Typography>

      {agendaMes.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {agendaMes.error}
        </Alert>
      )}

      <SeccionTarjeta titulo="Calendario">
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
            <ListaDeEventos eventos={delDia} cargando={agendaMes.cargando} vacio="Sin visitas ni trabajos." />
          </Grid>
        </Grid>
      </SeccionTarjeta>

      <Box id="horario" sx={{ mt: 3 }}>
        <SeccionTarjeta titulo="Mi horario de trabajo">
          <HorarioTrabajo />
        </SeccionTarjeta>
      </Box>
    </>
  )
}