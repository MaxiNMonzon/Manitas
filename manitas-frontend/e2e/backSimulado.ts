import { expect, type Page, type Route } from '@playwright/test'

// Respuestas falsas del back para los tests end-to-end. Viven acá, en los tests, y no en la app:
// Playwright intercepta los pedidos que hace el front (page.route) y contesta con estos datos,
// así los tests corren sin levantar el back ni la base de datos.

const hoy = new Date()
const enDias = (dias: number, hora = 10) => {
  const d = new Date(hoy)
  d.setDate(d.getDate() + dias)
  d.setHours(hora, 0, 0, 0)
  return d.toISOString()
}

const profesional = { idUsuario: 7, nombre: 'Raúl', apellido: 'Bustos', telefono: '3415550001' }

// GET /solicitud-de-servicio del cliente: una con presupuesto para responder y una terminada
const solicitudesCliente = [
  {
    idSolicitud: 24,
    estadoServicio: 'presupuestado',
    urgente: false,
    descripcionProblema: 'Pierde agua la canilla de la cocina',
    fechaSolicitud: enDias(-3),
    fechaCambioEstado: enDias(-1),
    fechaVisita: enDias(-1),
    costoVisita: 5000,
    costoEstimado: null,
    costoFinal: 45000,
    horasTrabajo: 2,
    fechaFinReal: null,
    especialidad: { nombreEspecialidad: 'Plomería' },
    profesional,
  },
  {
    idSolicitud: 12,
    estadoServicio: 'finalizado',
    urgente: false,
    descripcionProblema: 'Cambiar el cuerito del baño',
    fechaSolicitud: enDias(-30),
    fechaCambioEstado: enDias(-20),
    fechaVisita: enDias(-25),
    costoEstimado: 20000,
    costoFinal: 20000,
    fechaFinReal: enDias(-20),
    fechaPago: enDias(-20),
    especialidad: { nombreEspecialidad: 'Plomería' },
    profesional,
  },
]

const perfilCliente = {
  idUsuario: 3,
  dni: 30111222,
  nombre: 'Valeria',
  apellido: 'Godoy',
  fechaNacimiento: '1990-05-10',
  correo: 'valeria@ejemplo.com',
  telefono: '3415550002',
  calle: 'Mendoza',
  altura: 3200,
  piso: null,
  depto: null,
  zonaResidencia: {
    idZona: 1,
    nombreZona: 'Centro',
    localidad: { idLocalidad: 1, nombreLocalidad: 'Rosario', provincia: { idProvincia: 1, nombreProvincia: 'Santa Fe' } },
  },
}

// Qué contesta cada pedido. Lo que no está acá responde una lista vacía
function responder(metodo: string, ruta: string): unknown {
  if (metodo === 'POST' && ruta.startsWith('/auth/login/')) return { token: 'token-de-prueba', correo: perfilCliente.correo }
  if (ruta === '/auth/perfil') return perfilCliente
  if (ruta === '/solicitud-de-servicio') return solicitudesCliente
  if (ruta.startsWith('/solicitud-de-servicio/')) {
    const id = Number(ruta.split('/')[2])
    if (id) return solicitudesCliente.find((s) => s.idSolicitud === id) ?? {}
  }
  if (ruta === '/especialidad') return [{ idEspecialidad: 2, nombreEspecialidad: 'Plomería', palabrasClave: 'caño, canilla' }]
  return []
}

async function contestar(route: Route) {
  const url = new URL(route.request().url())
  await route.fulfill({ json: responder(route.request().method(), url.pathname) })
}

// Intercepta los pedidos al back (cualquier fetch que no vaya al propio servidor de Vite)
export async function simularBack(page: Page) {
  await page.route(
    (url) => url.port !== '5173',
    (route) => (['fetch', 'xhr'].includes(route.request().resourceType()) ? contestar(route) : route.continue()),
  )
}

// Entra como cliente por el formulario de login (el back simulado acepta cualquier contraseña)
// y después va a la pantalla pedida
export async function entrarComoCliente(page: Page, pantalla?: string) {
  await simularBack(page)
  await page.goto('/login')
  await page.getByLabel('Email').fill(perfilCliente.correo)
  await page.locator('input[type="password"]').fill('Contraseña123')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(/\/app$/)
  if (pantalla) await page.goto(pantalla)
}