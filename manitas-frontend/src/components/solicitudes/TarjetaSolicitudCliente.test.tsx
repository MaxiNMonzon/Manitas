import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TarjetaSolicitudCliente from './TarjetaSolicitudCliente'
import type { SolicitudResumen } from '../../types'

// Una solicitud como la que devuelve GET /solicitud-de-servicio al cliente
function solicitud(datos: Partial<SolicitudResumen> = {}): SolicitudResumen {
  return {
    idSolicitud: 24,
    estadoServicio: 'presupuestado',
    urgente: false,
    descripcionProblema: 'Pintar el living',
    fechaCambioEstado: new Date().toISOString(),
    fechaVisita: '2026-11-03T10:00:00',
    costoEstimado: null,
    costoFinal: 180000,
    fechaFinReal: null,
    especialidad: { nombreEspecialidad: 'Pintura' },
    profesional: { idUsuario: 3, nombre: 'Marta', apellido: 'Ríos', telefono: '3418889999' },
    ...datos,
  }
}

describe('TarjetaSolicitudCliente', () => {
  it('muestra el profesional, el trabajo, la dirección y el estado en palabras del cliente', () => {
    render(<TarjetaSolicitudCliente solicitud={solicitud()} direccion="Zeballos 1451, Centro" onVerDetalles={() => {}} />)

    expect(screen.getByText('Marta Ríos')).toBeInTheDocument()
    expect(screen.getByText('Pintar el living')).toBeInTheDocument()
    expect(screen.getByText('Zeballos 1451, Centro')).toBeInTheDocument()
    expect(screen.getByText('Presupuesto recibido')).toBeInTheDocument()
    // Le toca responder al cliente: se lo dice con el monto
    expect(screen.getByText(/Presupuesto recibido: .* esperando tu respuesta/)).toBeInTheDocument()
  })

  it('avisa al tocar "Ver detalles" (output del componente)', async () => {
    const onVerDetalles = vi.fn()
    render(<TarjetaSolicitudCliente solicitud={solicitud()} direccion={null} onVerDetalles={onVerDetalles} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ver detalles' }))
    expect(onVerDetalles).toHaveBeenCalledTimes(1)
  })

  it('una urgencia sin profesional dice que se está buscando y se marca como urgente', () => {
    render(
      <TarjetaSolicitudCliente
        solicitud={solicitud({ estadoServicio: 'solicitado', urgente: true, profesional: null, fechaVisita: null })}
        direccion={null}
        onVerDetalles={() => {}}
      />,
    )

    expect(screen.getByText('Buscando profesional')).toBeInTheDocument()
    expect(screen.getByText('Urgente')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('una solicitud pagada muestra el chip "Pagado"', () => {
    render(
      <TarjetaSolicitudCliente
        solicitud={solicitud({ estadoServicio: 'finalizado', fechaPago: '2026-10-20T12:00:00', fechaFinReal: '2026-10-20T12:00:00' })}
        direccion={null}
        onVerDetalles={() => {}}
      />,
    )

    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText('Finalizada')).toBeInTheDocument()
  })
})
