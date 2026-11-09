/// <reference lib="dom" />
import { expect, test } from '@playwright/test'
import { entrarComoCliente } from './backSimulado.js'

// Recorren la app en un navegador de verdad, como un cliente. Las respuestas del back
// las simula el test (ver backSimulado.ts), así corren sin back ni base de datos

test('sin sesión, las pantallas privadas mandan al login', async ({ page }) => {
  await page.goto('/app/solicitudes')
  await expect(page).toHaveURL(/\/login$/)
})

test('el cliente ve sus solicitudes y abre el detalle de una', async ({ page }) => {
  await entrarComoCliente(page, '/app/solicitudes')

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
  await entrarComoCliente(page, '/app/ayuda')

  await page.getByPlaceholder(/Buscá tu duda/).fill('cancelar')
  await expect(page.getByText('¿Puedo cancelar?')).toBeVisible()
  await expect(page.getByText('¿Cómo pago?')).toBeHidden()

  // Validación del formulario de consulta
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  await expect(page.getByText('Elegí un tema')).toBeVisible()
  await expect(page.getByText(/al menos 10 letras/)).toBeVisible()
})

test('un cliente no puede entrar a las pantallas del administrador', async ({ page }) => {
  await entrarComoCliente(page)
  await expect(page.getByText('¿Qué necesitás arreglar hoy?')).toBeVisible()

  // Escribe a mano la dirección del panel de administración: vuelve a su inicio
  await page.evaluate(() => {
    window.history.pushState({}, '', '/app/catalogos')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByText('Panel de administración')).toBeHidden()
})