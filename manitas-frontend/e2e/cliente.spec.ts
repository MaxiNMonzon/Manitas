/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test'

// Entra con la sesión de prueba (sin back) desde los accesos del login, como un usuario
async function entrarComoClienteDemo(page: Page, pantalla: string) {
  await page.goto('/login')
  await expect(page.getByText('Accesos provisorios (solo desarrollo)')).toBeVisible()
  // El primer grupo de accesos es "Como cliente"
  await page.getByRole('button', { name: pantalla, exact: true }).first().click()
}

test('sin sesión, las pantallas privadas mandan al login', async ({ page }) => {
  await page.goto('/app/solicitudes')
  await expect(page).toHaveURL(/\/login$/)
})

test('el cliente ve sus solicitudes y abre el detalle de una', async ({ page }) => {
  await entrarComoClienteDemo(page, 'Solicitudes')

  await expect(page.getByRole('heading', { name: 'Mis solicitudes' })).toBeVisible()
  await expect(page.getByRole('tab', { name: /En curso/ })).toBeVisible()

  // Abre el detalle de la primera solicitud de la lista
  await page.getByRole('button', { name: 'Ver detalles' }).first().click()
  const detalle = page.getByRole('dialog')
  await expect(detalle.getByText(/Solicitud #\d+/)).toBeVisible()
  await detalle.getByRole('button', { name: 'Cerrar' }).click()
  await expect(detalle).toBeHidden()

  // Pestaña de completadas
  await page.getByRole('tab', { name: 'Completadas' }).click()
  await expect(page.getByText('Finalizada').first()).toBeVisible()
})

test('el cliente busca en Ayuda y no puede mandar una consulta vacía', async ({ page }) => {
  await entrarComoClienteDemo(page, 'Ayuda')

  await page.getByPlaceholder(/Buscá tu duda/).fill('cancelar')
  await expect(page.getByText('¿Puedo cancelar?')).toBeVisible()
  await expect(page.getByText('¿Cómo pago?')).toBeHidden()

  // Validación del formulario de consulta
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  await expect(page.getByText('Elegí un tema')).toBeVisible()
  await expect(page.getByText(/al menos 10 letras/)).toBeVisible()
})

test('un cliente no puede entrar a las pantallas del administrador', async ({ page }) => {
  await entrarComoClienteDemo(page, 'Inicio')
  await expect(page.getByText('¿Qué necesitás arreglar hoy?')).toBeVisible()

  // Escribe a mano la dirección del panel de administración: vuelve a su inicio
  await page.evaluate(() => {
    window.history.pushState({}, '', '/app/catalogos')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByText('Panel de administración')).toBeHidden()
})
