import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import HandymanIcon from '@mui/icons-material/Handyman'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../auth/useAuth'

// Layout de la parte privada de la app: solo se ve con sesión iniciada.
export default function Layout() {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()

  if (!sesion) return <Navigate to="/login" replace />

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <HandymanIcon />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Manitas
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
