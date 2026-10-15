import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { traerAvisos } from '../api/solicitudes'
import { useAuth } from '../auth/useAuth'
import { useCarga } from '../hooks/useCarga'
import type { Aviso } from '../types'

// Los avisos se consultan al abrir la app y cada 1 minuto (no hay notificaciones push)
const CADA_UN_MINUTO = 60 * 1000
const LEIDOS_KEY = 'manitas.avisosLeidos'

// El back arma los avisos en el momento y no los guarda, así que "leído" se recuerda en el
// navegador. Se sacan los números de la clave porque el texto cambia solo ("quedan 42 minutos")
function claveDe(aviso: Aviso) {
  return `${aviso.idSolicitud}|${aviso.mensaje.replace(/\d+/g, '#')}`
}

function leerLeidos(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LEIDOS_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

// Campanita con los avisos (urgentes, próximas visitas, presupuestos, pagos, calificar).
export default function Notificaciones() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const [ancla, setAncla] = useState<HTMLElement | null>(null)
  const [leidos, setLeidos] = useState(leerLeidos)

  const rol = sesion?.rol ?? 'cliente'
  const { datos, error } = useCarga(`avisos-${rol}`, () => traerAvisos(rol), CADA_UN_MINUTO)
  const avisos = datos ?? []
  const sinLeer = avisos.filter((a) => !leidos.has(claveDe(a))).length

  const cerrar = () => {
    setAncla(null)
    // Al cerrar el menú se marcan como leídos (se guardan solo los que siguen existiendo)
    const nuevos = new Set(avisos.map(claveDe))
    setLeidos(nuevos)
    try {
      localStorage.setItem(LEIDOS_KEY, JSON.stringify([...nuevos]))
    } catch {
      // Sin almacenamiento (modo privado): no pasa nada, solo no se recuerda
    }
  }

  return (
    <>
      <IconButton color="inherit" aria-label="Avisos" onClick={(e) => setAncla(e.currentTarget)}>
        <Badge badgeContent={sinLeer} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={ancla}
        open={Boolean(ancla)}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Avisos
        </Typography>
        <Divider />
        {error && (
          <MenuItem disabled>
            <ListItemText primary="No se pudieron cargar los avisos" secondary={error} />
          </MenuItem>
        )}
        {!error && avisos.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No tenés avisos" />
          </MenuItem>
        )}
        {avisos.map((a) => {
          const leido = leidos.has(claveDe(a))
          const urgente = a.mensaje.startsWith('URGENTE')
          return (
            <MenuItem
              key={claveDe(a)}
              onClick={() => {
                cerrar()
                navigate('/app/solicitudes')
              }}
              sx={{ whiteSpace: 'normal', bgcolor: leido ? undefined : 'action.hover' }}
            >
              <ListItemText
                primary={a.mensaje}
                slotProps={{
                  primary: { variant: 'body2', sx: { fontWeight: leido ? 400 : 600, color: urgente ? 'error.main' : undefined } },
                }}
              />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
