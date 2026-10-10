import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '../auth/useAuth'
import type { Rol } from '../types'

// PROVISORIO (solo en desarrollo): accesos directos a las pantallas privadas con una sesión
// falsa, para poder verlas mientras el back no tenga datos. Borrar este archivo y su uso en
// Login.tsx cuando ya se pueda iniciar sesión de verdad.
const accesos: { rol: Rol; titulo: string; rutas: { label: string; path: string }[] }[] = [
  {
    rol: 'cliente',
    titulo: 'Como cliente',
    rutas: [
      { label: 'Inicio', path: '/app' },
      { label: 'Solicitudes', path: '/app/solicitudes' },
      { label: 'Pagos', path: '/app/pagos' },
      { label: 'Ayuda', path: '/app/ayuda' },
      { label: 'Mi perfil', path: '/app/perfil' },
      { label: 'Profesionales', path: '/app/profesionales' },
      { label: 'Promociones', path: '/app/promociones' },
    ],
  },
  {
    rol: 'profesional',
    titulo: 'Como profesional',
    rutas: [
      { label: 'Inicio', path: '/app' },
      { label: 'Mi perfil', path: '/app/perfil' },
    ],
  },
]

export default function AccesosDemo() {
  const { loginDemo } = useAuth()
  const navigate = useNavigate()

  if (!import.meta.env.DEV) return null

  return (
    <Alert severity="warning" icon={false} sx={{ mt: 4 }}>
      <AlertTitle>Accesos provisorios (solo desarrollo)</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        Entran con una sesión de prueba, sin backend. Los datos que se ven son mock.
      </Typography>
      <Stack spacing={1.5}>
        {accesos.map((a) => (
          <div key={a.rol}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {a.titulo}
            </Typography>
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
              {a.rutas.map((r) => (
                <Button
                  key={r.path}
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    loginDemo(a.rol)
                    navigate(r.path)
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>
    </Alert>
  )
}
