import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import DoneIcon from '@mui/icons-material/Done'
import { api } from '../../api/client'
import { useCarga } from '../../hooks/useCarga'

interface Consulta {
  idConsulta: number
  correo: string
  tema: string
  mensaje: string
  rol: 'cliente' | 'profesional' | 'visitante'
  correoCuenta: string | null
  fecha: string
  respondida: boolean
}

// Bandeja de las consultas que llegan desde "Ayuda" (GET /consulta). El admin le escribe a la persona
// por correo y la marca como respondida (PATCH /consulta/:id/respondida)
export default function ConsultasAdmin() {
  const [verRespondidas, setVerRespondidas] = useState(false)
  const [marcando, setMarcando] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const consultas = useCarga('consultas-admin', () => api.get<Consulta[]>('/consulta'))

  const todas = consultas.datos ?? []
  const pendientes = todas.filter((consulta) => !consulta.respondida)
  const lista = verRespondidas ? todas.filter((consulta) => consulta.respondida) : pendientes

  const marcar = async (id: number) => {
    setMarcando(id)
    setError(null)
    try {
      await api.patch(`/consulta/${id}/respondida`, {})
      consultas.recargar()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo marcar')
    } finally {
      setMarcando(null)
    }
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Consultas de Ayuda
      </Typography>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={verRespondidas ? 1 : 0} onChange={(_, elegida: number) => setVerRespondidas(elegida === 1)} variant="fullWidth">
          <Tab label={`Sin responder (${pendientes.length})`} />
          <Tab label="Respondidas" />
        </Tabs>
      </Paper>

      {(error ?? consultas.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? consultas.error}
        </Alert>
      )}

      {consultas.cargando ? (
        <Skeleton variant="rounded" height={160} />
      ) : lista.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{verRespondidas ? 'Todavía no hay consultas respondidas.' : 'No hay consultas pendientes.'}</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {lista.map((consulta) => (
            <Paper key={consulta.idConsulta} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                <Chip size="small" color="primary" label={consulta.tema} />
                <Chip size="small" variant="outlined" label={consulta.rol} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(consulta.fecha).toLocaleString('es-AR')} · {consulta.correo}
                  {consulta.correoCuenta && consulta.correoCuenta !== consulta.correo ? ` (cuenta: ${consulta.correoCuenta})` : ''}
                </Typography>
              </Stack>
              <Typography sx={{ whiteSpace: 'pre-line', mb: 1.5 }}>{consulta.mensaje}</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<MailOutlinedIcon />}
                  href={`mailto:${consulta.correo}?subject=${encodeURIComponent(`Manitas: tu consulta sobre ${consulta.tema}`)}`}
                >
                  Responder por correo
                </Button>
                {!consulta.respondida && (
                  <Button size="small" startIcon={<DoneIcon />} loading={marcando === consulta.idConsulta} onClick={() => marcar(consulta.idConsulta)}>
                    Marcar como respondida
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  )
}
