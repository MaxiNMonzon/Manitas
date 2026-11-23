import { describe, expect, it } from 'vitest'
import { conEspecialidades, validarContacto, validarDomicilio, validarTrabajo } from './reglas'

// Las reglas que comparten el registro y "Mi perfil" (cliente y profesional)
describe('Reglas de los datos del cliente y del profesional', () => {
  const contacto = { nombre: 'Raúl', apellido: 'Bustos', correo: 'raul@gmail.com', telefono: '3416662001' }

  it('acepta un contacto bien cargado, aunque el email tenga espacios alrededor', () => {
    expect(validarContacto(contacto)).toEqual({})
    expect(validarContacto({ ...contacto, correo: '  raul@gmail.com ' })).toEqual({})
  })

  it('pide teléfono solo con números', () => {
    expect(validarContacto({ ...contacto, telefono: '341-666' }).telefono).toBeDefined()
  })

  it('el domicilio pide calle, una altura mayor a 0 y la zona', () => {
    const domicilio = { calle: 'Mendoza', altura: '3240', piso: '', depto: '', idZona: '4' }
    expect(validarDomicilio(domicilio)).toEqual({})
    expect(validarDomicilio({ ...domicilio, altura: '' }).altura).toBe('Ingresá la altura')
    expect(validarDomicilio({ ...domicilio, altura: '0' }).altura).toBe('La altura es un número mayor a 0')
    expect(validarDomicilio({ ...domicilio, idZona: '' }).idZona).toBe('Elegí tu zona')
  })

  // Con la misma forma que tienen en el perfil del back
  const plomeria = { idEspecialidad: 1, nombreEspecialidad: 'Plomería' }
  const gas = { idEspecialidad: 2, nombreEspecialidad: 'Gas' }

  const trabajo = {
    cbu: '',
    descripcion: '',
    especialidades: [plomeria],
    zonas: [{ idZona: 4, nombreZona: 'Centro' }],
    matriculas: [],
  }

  it('el CBU es opcional, pero si se carga tiene que ser válido (antes el registro solo contaba los 22 números)', () => {
    expect(validarTrabajo(trabajo)).toEqual({})
    expect(validarTrabajo({ ...trabajo, cbu: '0170099220000067890123' })).toEqual({})
    expect(validarTrabajo({ ...trabajo, cbu: '123' }).cbu).toBe('El CBU/CVU tiene 22 números')
    // 22 números pero mal copiado (cambia el último dígito)
    expect(validarTrabajo({ ...trabajo, cbu: '0170099220000067890124' }).cbu).toContain('no es válido')
  })

  it('pide al menos una especialidad y una zona de trabajo', () => {
    const e = validarTrabajo({ ...trabajo, especialidades: [], zonas: [] })
    expect(e.especialidades).toBeDefined()
    expect(e.zonas).toBeDefined()
  })

  it('al sacar una especialidad se van también sus habilidades y matrículas', () => {
    const elegido = {
      especialidades: [plomeria, gas],
      habilidades: [
        { idServicio: 10, nombreServicio: 'Destapaciones', especialidad: plomeria },
        { idServicio: 20, nombreServicio: 'Instalación de artefactos', especialidad: gas },
      ],
      matriculas: [{ clave: 1, numero: 'MG-4521', descripcion: '', idEspecialidad: '2' }],
    }
    const sinGas = conEspecialidades(elegido, [plomeria])
    expect(sinGas.habilidades.map((h) => h.idServicio)).toEqual([10])
    expect(sinGas.matriculas).toEqual([])
  })
})