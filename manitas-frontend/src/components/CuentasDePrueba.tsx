import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '../auth/useAuth'
import type { Rol } from '../types'

// Solo en desarrollo: entrar con un clic a las cuentas que crea el seed del back
// (pnpm run seed:demo en manitas-backend, ver SEED.md). Son cuentas reales: usan la API.
const CONTRASEÑA = 'Manitas123'
const cuentas: { rol: Rol; titulo: string; personas: { nombre: string; correo: string; ayuda: string }[] }[] = [
  {
    rol: 'cliente',
    titulo: 'Clientes',
    personas: [
      { nombre: 'Laura', correo: 'laura.cliente@manitas.test', ayuda: 'Tiene una en cada estado: presupuesto para aceptar, trabajo para pagar, cambio de horario...' },
      { nombre: 'Martín', correo: 'martin.cliente@manitas.test', ayuda: 'Visita hecha, esperando presupuesto' },
      { nombre: 'Sofía', correo: 'sofia.cliente@manitas.test', ayuda: 'Una nueva para Jorge' },
      { nombre: 'Diego', correo: 'diego.cliente@manitas.test', ayuda: 'Una nueva para Oscar' },
      { nombre: 'Carla', correo: 'carla.cliente@manitas.test', ayuda: 'Vive en el distrito Noroeste' },
    ],
  },
  {
    rol: 'profesional',
    titulo: 'Profesionales',
    personas: [
      { nombre: 'Jorge (plomero/gas)', correo: 'jorge.plomero@manitas.test', ayuda: 'Nuevas para aceptar y una visita para presupuestar' },
      { nombre: 'Oscar (electricista)', correo: 'oscar.electricista@manitas.test', ayuda: 'Una nueva y un trabajo por cobrar' },
      { nombre: 'Marta (pintura)', correo: 'marta.pintora@manitas.test', ayuda: 'Visita confirmada' },
      { nombre: 'Nicolás (climatización)', correo: 'nicolas.clima@manitas.test', ayuda: 'Propuso otro horario' },
      { nombre: 'Julián (gas/clima)', correo: 'julian.gasista@manitas.test', ayuda: 'Presupuesto enviado' },
      { nombre: 'Lucía (carpintería)', correo: 'lucia.carpintera@manitas.test', ayuda: '' },
      { nombre: 'Ramón (cerrajería)', correo: 'ramon.cerrajero@manitas.test', ayuda: '' },
      { nombre: 'Ana (limpieza)', correo: 'ana.limpieza@manitas.test', ayuda: '' },
      { nombre: 'Pablo (jardinería)', correo: 'pablo.jardinero@manitas.test', ayuda: '' },
    ],
  },
  {
    rol: 'admin',
    titulo: 'Administrador (ADMIN_CORREO / ADMIN_CONTRASENA del .env del back)',
    personas: [{ nombre: 'Administrador', correo: 'admin@manitas.test', ayuda: 'Catálogos (CRUD) y consultas de Ayuda' }],
  },
]

export default function CuentasDePrueba() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [entrando, setEntrando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!import.meta.env.DEV) return null

  const entrar = async (rol: Rol, correo: string) => {
    setEntrando(correo)
    setError(null)
    try {
      await login(rol, { correo, contraseña: CONTRASEÑA })
      navigate('/app')
    } catch (e) {
      setError(`${e instanceof Error ? e.message : 'No se pudo entrar'}. ¿Corriste "pnpm run seed:demo" en el back?`)
    } finally {
      setEntrando(null)
    }
  }

  return (
    <Alert severity="info" icon={false} sx={{ mt: 2 }}>
      <AlertTitle>Cuentas de prueba (con el back)</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        Las crea <code>pnpm run seed:demo</code> en el back. Contraseña de todas: <strong>{CONTRASEÑA}</strong>
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={1.5}>
        {cuentas.map((grupo) => (
          <div key={grupo.rol}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {grupo.titulo}
            </Typography>
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
              {grupo.personas.map((p) => (
                <Button
                  key={p.correo}
                  size="small"
                  variant="outlined"
                  title={`${p.correo}${p.ayuda ? ` — ${p.ayuda}` : ''}`}
                  loading={entrando === p.correo}
                  disabled={entrando !== null && entrando !== p.correo}
                  onClick={() => entrar(grupo.rol, p.correo)}
                >
                  {p.nombre}
                </Button>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>
    </Alert>
  )
}
