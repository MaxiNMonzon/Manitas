import { describe, expect, it } from 'vitest'
import { esMontoValido, formatoPesos, limpiarMonto, montoATexto, pesosCorto, textoAMonto } from './dinero'

// Intl pone un espacio "duro" entre el $ y el número: se normaliza para comparar
const texto = (valor: string) => valor.replace(/\s/g, ' ')

describe('dinero', () => {
  it('muestra los centavos solo cuando hay', () => {
    expect(texto(formatoPesos(45000))).toBe('$ 45.000')
    expect(texto(formatoPesos(45000.5))).toBe('$ 45.000,50')
    expect(texto(formatoPesos(null))).toBe('$ 0')
    expect(texto(pesosCorto(850.25))).toBe('$ 850,25')
    expect(pesosCorto(45000)).toBe('$45k')
  })

  it('mientras se escribe deja números y un separador con hasta 2 decimales', () => {
    expect(limpiarMonto('15000')).toBe('15000')
    expect(limpiarMonto('15000,5')).toBe('15000,5')
    expect(limpiarMonto('15000.50')).toBe('15000.50')
    // "15.000" (punto de miles) no se corta a "15.00" (15 pesos): queda así y la validación lo marca
    expect(limpiarMonto('15.000')).toBe('15.000')
    expect(esMontoValido(limpiarMonto('15.000'))).toBe(false)
    expect(limpiarMonto('$ 15.000,50')).toBe('15.000') // un segundo separador no se acepta
    expect(limpiarMonto('abc')).toBe('')
    expect(limpiarMonto('123456789012')).toBe('1234567890')
  })

  it('valida y convierte el texto a número', () => {
    expect(esMontoValido('15000')).toBe(true)
    expect(esMontoValido('15000,5')).toBe(true)
    expect(esMontoValido('15000.50')).toBe(true)
    expect(esMontoValido('15000,')).toBe(false)
    expect(esMontoValido('15.000,50')).toBe(false)
    expect(textoAMonto('15000,50')).toBe(15000.5)
    expect(textoAMonto('15000.5')).toBe(15000.5)
  })

  it('pasa un monto guardado a texto para editarlo', () => {
    expect(montoATexto(15000)).toBe('15000')
    expect(montoATexto(15000.5)).toBe('15000,50')
  })
})