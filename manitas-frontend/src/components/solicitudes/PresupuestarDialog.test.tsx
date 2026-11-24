import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PresupuestarDialog from './PresupuestarDialog'
import { presupuestar } from '../../api/solicitudes'
import type { SolicitudResumen } from '../../types'

// No se llama al back: se revisa qué le mandaría
vi.mock('../../api/solicitudes', () => ({ presupuestar: vi.fn(() => Promise.resolve()) }))

// Un trabajo ya contratado: el diálogo pide solo el precio nuevo (sin las horas)
const contratada = {
  idSolicitud: 24,
  estadoServicio: 'contratado',
  descripcionProblema: 'Cambiar la canilla',
  cliente: { nombre: 'Laura' },
} as SolicitudResumen

describe('PresupuestarDialog: el precio con centavos', () => {
  beforeEach(() => vi.mocked(presupuestar).mockClear())

  it('acepta centavos con coma y los manda como número', async () => {
    render(<PresupuestarDialog solicitud={contratada} onClose={() => {}} onEnviado={() => {}} />)

    await userEvent.type(screen.getByLabelText(/precio nuevo/i), '15000,50')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(presupuestar).toHaveBeenCalledWith(24, 15000.5, undefined)
  })

  it('un punto de miles ("15.000") no se toma como 15 pesos: avisa y no deja enviar', async () => {
    render(<PresupuestarDialog solicitud={contratada} onClose={() => {}} onEnviado={() => {}} />)

    await userEvent.type(screen.getByLabelText(/precio nuevo/i), '15.000')

    expect(screen.getByText(/los centavos van después de una coma/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    expect(presupuestar).not.toHaveBeenCalled()
  })
})
