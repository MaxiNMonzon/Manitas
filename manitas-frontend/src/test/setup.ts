// Se ejecuta antes de cada archivo de test: agrega comparaciones como toBeInTheDocument()
// y limpia lo que dibujó cada test
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())