// Todo lo de plata en un solo lugar: cómo se muestra y cómo se carga. Los montos tienen hasta 2 decimales
// (centavos), igual que en el back (DECIMAL(12,2)).

const sinCentavos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const conCentavos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })

// "$ 45.000" si es un monto redondo, "$ 45.000,50" si tiene centavos
export const formatoPesos = (monto: number | null | undefined) => {
  const valor = monto ?? 0
  return (Number.isInteger(valor) ? sinCentavos : conCentavos).format(valor)
}

// Para el eje de un gráfico, donde no entra el número entero: "$45k". Debajo de mil, el monto completo
export const pesosCorto = (monto: number) => (monto >= 1000 ? `$${Math.round(monto / 1000)}k` : formatoPesos(monto))

// ---------- Cargar un monto en un campo de texto ----------
// Se escribe con coma o con punto para los centavos ("15000,50" o "15000.50"), sin separador de miles.

// Hasta 10 cifras enteras, como la columna de la base
const MAXIMO_ENTEROS = 10

// Lo que se deja escribir mientras se tipea: números y un solo separador decimal.
// Las cifras después del separador no se cortan a propósito: si alguien escribe "15.000" pensando en
// el punto de miles, cortarlo dejaría "15.00" (15 pesos). Así queda "15.000" y la validación lo marca
export function limpiarMonto(texto: string): string {
  const soloValidos = texto.replace(/[^\d.,]/g, '')
  const separador = soloValidos.search(/[.,]/)
  if (separador === -1) return soloValidos.slice(0, MAXIMO_ENTEROS)
  const enteros = soloValidos.slice(0, separador).slice(0, MAXIMO_ENTEROS)
  const decimales = soloValidos.slice(separador + 1).replace(/[.,]/g, '').slice(0, 3)
  return `${enteros}${soloValidos[separador]}${decimales}`
}

// El mensaje de error de un monto mal escrito
export const AYUDA_MONTO = 'Solo números; los centavos van después de una coma (ej: 15000,50)'

// Si el texto es un monto válido: números y, si tiene centavos, 1 o 2 cifras después de la coma
export const esMontoValido = (texto: string) => /^\d{1,10}([.,]\d{1,2})?$/.test(texto)

// "15000,50" → 15000.5
export const textoAMonto = (texto: string) => Number(texto.replace(',', '.'))

// 15000.5 → "15000,50" (para cargar el monto guardado en un campo y poder editarlo)
export const montoATexto = (monto: number) => (Number.isInteger(monto) ? String(monto) : monto.toFixed(2).replace('.', ','))