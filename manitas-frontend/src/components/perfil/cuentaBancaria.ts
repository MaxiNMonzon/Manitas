// Datos que se sacan del CBU/CVU (no hace falta pedirle el banco al profesional):
// los 3 primeros números del CBU son el código del banco; un CVU empieza con 000.

const BANCOS: Record<string, string> = {
  '007': 'Banco Galicia',
  '011': 'Banco Nación',
  '014': 'Banco Provincia',
  '015': 'ICBC',
  '017': 'BBVA',
  '020': 'Bancor (Banco de Córdoba)',
  '027': 'Banco Supervielle',
  '029': 'Banco Ciudad',
  '034': 'Banco Patagonia',
  '044': 'Banco Hipotecario',
  '065': 'Banco Municipal de Rosario',
  '072': 'Banco Santander',
  '143': 'Brubank',
  '150': 'HSBC',
  '191': 'Banco Credicoop',
  '259': 'Banco Itaú',
  '285': 'Banco Macro',
  '299': 'Banco Comafi',
  '330': 'Nuevo Banco de Santa Fe',
  '386': 'Nuevo Banco de Entre Ríos',
}

const esCvu = (numero: string) => numero.startsWith('000')

// Banco (o billetera) de un CBU/CVU completo; null si todavía no tiene los 22 números
export function entidadDeCuenta(numero: string): string | null {
  if (!/^\d{22}$/.test(numero)) return null
  if (esCvu(numero)) return numero.startsWith('0000003') ? 'Mercado Pago (CVU)' : 'Billetera virtual (CVU)'
  return BANCOS[numero.slice(0, 3)] ?? `Banco (código ${numero.slice(0, 3)})`
}

function digitoVerificador(digitos: string, pesos: number[]): number {
  const suma = [...digitos].reduce((s, d, i) => s + Number(d) * pesos[i], 0)
  return (10 - (suma % 10)) % 10
}

// Un CBU trae dos dígitos verificadores (posiciones 8 y 22): así se detecta un número mal copiado.
// Al CVU no se le aplica (lo arma cada billetera)
export function cbuValido(numero: string): boolean {
  if (!/^\d{22}$/.test(numero)) return false
  if (esCvu(numero)) return true
  const bloque1 = numero.slice(0, 7)
  const bloque2 = numero.slice(8, 21)
  return (
    digitoVerificador(bloque1, [7, 1, 3, 9, 7, 1, 3]) === Number(numero[7]) &&
    digitoVerificador(bloque2, [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3]) === Number(numero[21])
  )
}