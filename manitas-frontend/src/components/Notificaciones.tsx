import { useState } from 'react'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { notificaciones as notificacionesMock } from '../mocks/inicioCliente'

// Campanita con las notificaciones (próximas visitas, presupuestos, promos).
// Por ahora con datos mock: todavía no hay endpoint en el back.
export default function Notificaciones() {
  const [ancla, setAncla] = useState<HTMLElement | null>(null)
  const [notificaciones, setNotificaciones] = useState(notificacionesMock)
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  const cerrar = () => {
    setAncla(null)
    // Al cerrar el menú, se marcan como leídas
    setNotificaciones((ns) => ns.map((n) => ({ ...n, leida: true })))
  }

  return (
    <>
      <IconButton color="inherit" aria-label="Notificaciones" onClick={(e) => setAncla(e.currentTarget)}>
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
        slotProps={{ paper: { sx: { width: 340, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Notificaciones
        </Typography>
        <Divider />
        {notificaciones.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No tenés notificaciones" />
          </MenuItem>
        )}
        {notificaciones.map((n) => (
          <MenuItem key={n.id} onClick={cerrar} sx={{ whiteSpace: 'normal', bgcolor: n.leida ? undefined : 'action.hover' }}>
            <ListItemText
              primary={n.texto}
              secondary={n.cuando}
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: n.leida ? 400 : 600 } } }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
