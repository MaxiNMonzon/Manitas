import { useState, type FormEvent } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import MailOutlineIcon from '@mui/icons-material/MailOutlined'
import { useAuth } from '../auth/useAuth'
import { enviarConsulta } from '../api/consultas'
import { preguntasDe } from '../components/ayuda/preguntasFrecuentes'
import SeccionTarjeta from '../components/SeccionTarjeta'

const MAX_MENSAJE = 2000
const OTRO_TEMA = 'Otro'

// Sin tildes ni mayúsculas, para que "cancelacion" encuentre "Cancelación"
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Pestaña "Ayuda": preguntas frecuentes según el rol (cliente o profesional) y, si no alcanzan,
// un formulario para mandar una consulta al administrador, que responde por correo
export default function Ayuda() {
  const { sesion } = useAuth()
  const esProfesional = sesion?.rol === 'profesional'
  const temas = preguntasDe(sesion?.rol)

  const [busqueda, setBusqueda] = useState('')
  const [temaFiltro, setTemaFiltro] = useState<string | null>(null)
  const [abierta, setAbierta] = useState<string | false>(false)

  // Formulario de consulta
  const [correo, setCorreo] = useState(sesion?.correo ?? '')
  const [tema, setTema] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const buscado = normalizar(busqueda.trim())
  const visibles = temas
    .filter((t) => !temaFiltro || t.tema === temaFiltro)
    .map((t) => ({
      ...t,
      preguntas: t.preguntas.filter((p) => !buscado || normalizar(`${p.pregunta} ${p.respuesta}`).includes(buscado)),
    }))
    .filter((t) => t.preguntas.length > 0)

  const errores = {
    correo: !/^\S+@\S+\.\S+$/.test(correo.trim()) ? 'Ingresá un email válido para poder responderte' : null,
    tema: !tema ? 'Elegí un tema' : null,
    mensaje: mensaje.trim().length < 10 ? 'Contanos un poco más (al menos 10 letras)' : null,
  }
  const hayErrores = Object.values(errores).some(Boolean)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setIntento(true)
    setResultado(null)
    if (hayErrores) return
    setEnviando(true)
    try {
      await enviarConsulta({
        correo: correo.trim(),
        tema,
        mensaje: mensaje.trim(),
        rol: sesion?.rol === 'cliente' || sesion?.rol === 'profesional' ? sesion.rol : 'visitante',
        correoCuenta: sesion?.correo,
      })
      setResultado({ tipo: 'success', texto: `¡Gracias! Recibimos tu consulta y te vamos a responder a ${correo.trim()}.` })
      setMensaje('')
      setTema('')
      setIntento(false)
    } catch (err) {
      setResultado({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo enviar la consulta' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Ayuda
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Preguntas frecuentes {esProfesional ? 'para profesionales' : 'para clientes'}. Si no encontrás la respuesta, escribinos abajo.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscá tu duda (ej: cancelar, pagar, horario)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
          <Chip label="Todos" color={temaFiltro === null ? 'primary' : 'default'} onClick={() => setTemaFiltro(null)} />
          {temas.map((t) => (
            <Chip
              key={t.tema}
              label={t.tema}
              color={temaFiltro === t.tema ? 'primary' : 'default'}
              variant={temaFiltro === t.tema ? 'filled' : 'outlined'}
              onClick={() => setTemaFiltro(temaFiltro === t.tema ? null : t.tema)}
            />
          ))}
        </Stack>
      </Paper>

      {visibles.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography color="text.secondary">No encontramos preguntas sobre eso. Mandanos tu consulta y te respondemos.</Typography>
        </Paper>
      ) : (
        <Stack spacing={3} sx={{ mb: 3 }}>
          {visibles.map((t) => (
            <Box key={t.tema}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t.tema}
              </Typography>
              {t.preguntas.map((p) => {
                const clave = `${t.tema}-${p.pregunta}`
                return (
                  <Accordion
                    key={clave}
                    disableGutters
                    variant="outlined"
                    // Buscando, se ven todas abiertas
                    expanded={buscado ? true : abierta === clave}
                    onChange={(_, abrir) => setAbierta(abrir ? clave : false)}
                    sx={{ '&:not(:last-of-type)': { borderBottom: 0 } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 500 }}>{p.pregunta}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="text.secondary">{p.respuesta}</Typography>
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>
          ))}
        </Stack>
      )}

      <SeccionTarjeta titulo="¿No encontraste lo que buscabas?" extra={<MailOutlineIcon color="primary" />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mandanos tu consulta y el equipo de Manitas te responde por correo. Si es sobre una solicitud, contanos su número
          (figura en el detalle, ej: "Solicitud #24").
        </Typography>
        <Box component="form" onSubmit={enviar} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Tu email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                error={intento && Boolean(errores.correo)}
                helperText={(intento && errores.correo) || 'Te respondemos a este correo'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tema"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                error={intento && Boolean(errores.tema)}
                helperText={intento && errores.tema}
              >
                {[...temas.map((t) => t.tema), OTRO_TEMA].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Tu consulta"
                placeholder="Contanos qué pasó o qué necesitás saber"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value.slice(0, MAX_MENSAJE))}
                error={intento && Boolean(errores.mensaje)}
                helperText={(intento && errores.mensaje) || `${mensaje.length}/${MAX_MENSAJE}`}
              />
            </Grid>
          </Grid>
          {resultado && (
            <Alert severity={resultado.tipo} sx={{ mt: 2 }}>
              {resultado.texto}
            </Alert>
          )}
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button type="submit" variant="contained" endIcon={<SendIcon />} loading={enviando}>
              Enviar consulta
            </Button>
          </Box>
        </Box>
      </SeccionTarjeta>
    </>
  )
}