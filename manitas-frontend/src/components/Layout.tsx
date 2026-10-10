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
import Typography from '@mui/material/Typography'
import HandymanIcon from '@mui/icons-material/Handyman'
import { useAuth } from '../auth/useAuth'
import { pestañaActiva, pestañas } from '../navegacion'
import Notificaciones from './Notificaciones'

const ALTO_NAV_INFERIOR = 64

// Layout de la parte privada de la app: solo se ve con sesión iniciada.
export default function Layout() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!sesion) return <Navigate to="/login" replace />

  const activa = pestañaActiva(pathname)
  const ir = (path: string) => navigate(path ? `/app/${path}` : '/app')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            component={RouterLink}
            to="/app"
            sx={{ alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
          >
            <HandymanIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Manitas
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
                Tu hogar en buenas manos
              </Typography>
            </Box>
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
              <Tab key={p.path} value={p.path} label={p.label} icon={p.icono} iconPosition="start" sx={{ minHeight: 64 }} />
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
