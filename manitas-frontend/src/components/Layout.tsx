import { Link as RouterLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Marca from './Marca'
import { useAuth } from '../auth/useAuth'
import { pestañaActiva, pestañasDe } from '../navegacion'
import Notificaciones from './Notificaciones'

const ALTO_NAV_INFERIOR = 64
// Barra de arriba más alta, para que el nombre se vea más grande
const ALTO_BARRA = { xs: 72, md: 84 }

// Layout de la parte privada de la app: solo se ve con sesión iniciada.
export default function Layout() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!sesion) return <Navigate to="/login" replace />

  const pestañas = pestañasDe(sesion.rol)
  const activa = pestañaActiva(pathname, pestañas)
  const ir = (path: string) => navigate(path ? `/app/${path}` : '/app')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 2, minHeight: ALTO_BARRA }}>
          <Stack
            direction="row"
            spacing={1}
            component={RouterLink}
            to="/app"
            sx={{
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none',
              // En celular el logo va al medio de la barra (la campanita queda a la derecha); en compu, a la izquierda
              position: { xs: 'absolute', md: 'static' },
              left: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(-50%)', md: 'none' },
            }}
          >
            <Marca variante="blanco" alto={{ xs: 40, md: 56 }} />
          </Stack>

          {/* Pestañas arriba solo en pantallas grandes */}
          <Tabs
            value={activa}
            onChange={(_, valor: string) => ir(valor)}
            textColor="inherit"
            slotProps={{ indicator: { sx: { bgcolor: 'common.white', height: 3 } } }}
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignSelf: 'stretch', '& .MuiTabs-flexContainer': { height: '100%', justifyContent: 'center' } }}
          >
            {pestañas.map((p) => (
              <Tab key={p.path} value={p.path} label={p.label} icon={p.icono} iconPosition="start" sx={{ minHeight: ALTO_BARRA.md, fontSize: '0.95rem' }} />
            ))}
          </Tabs>
          <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

          <Notificaciones />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, pb: { xs: `${ALTO_NAV_INFERIOR + 24}px`, md: 4 } }}>
        <Outlet />
      </Container>

      {/* Pestañas abajo en celulares y tablets */}
      <Paper
        elevation={8}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', md: 'none' }, zIndex: (t) => t.zIndex.appBar }}
      >
        <BottomNavigation value={activa} onChange={(_, valor: string) => ir(valor)} showLabels sx={{ height: ALTO_NAV_INFERIOR }}>
          {pestañas.map((p) => (
            <BottomNavigationAction key={p.path} value={p.path} label={p.label} icon={p.icono} sx={{ minWidth: 0, px: 0.5 }} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}