import { defineConfig, devices } from '@playwright/test'

// Tests end-to-end (npm run test:e2e): abren la app en un navegador de verdad y la recorren como un usuario.
// Usan la sesión de prueba (sin back), así se pueden correr en cualquier máquina.
// Si no tenés Google Chrome instalado: npx playwright install chromium y sacá `channel: 'chrome'`
export default defineConfig({
  testDir: './e2e',
  // El primer test espera a que Vite compile en frío (en carpetas sincronizadas puede tardar)
  timeout: 120_000,
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'celular', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
  // Levanta el front si no está corriendo
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
