import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Tests unitarios de componentes (npm test). Corren en un navegador simulado (jsdom).
// Los end-to-end están aparte, en e2e/ (npm run test:e2e, con Playwright)
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/test/setup.ts'],
    },
  }),
)