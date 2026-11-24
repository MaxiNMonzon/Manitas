// Cuentas y textos con plata, escritos en un solo lugar. Los montos tienen hasta 2 decimales (centavos).
// En JavaScript los decimales no son exactos (0.1 + 0.2 da 0.30000000000000004), así que las sumas
// se hacen en centavos (números enteros, que sí son exactos) y se vuelve a pesos al final.

const enCentavos = (monto: number) => Math.round(monto * 100);

// Redondea a centavos (ej: un promedio que da 15000.3333 → 15000.33)
export const redondearCentavos = (monto: number) => enCentavos(monto) / 100;

// Suma montos sin errores de decimales
export const sumarMontos = (montos: number[]) => montos.reduce((total, monto) => total + enCentavos(monto), 0) / 100;

// Si dos montos son iguales hasta el centavo (ej: lo que cobró Mercado Pago y lo que dice la solicitud)
export const mismoMonto = (uno: number, otro: number) => enCentavos(uno) === enCentavos(otro);

const sinCentavos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const conCentavos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "$ 45.000" si es un monto redondo, "$ 45.000,50" si tiene centavos (para los textos de los avisos)
export const formatoPesos = (monto: number) => (Number.isInteger(monto) ? sinCentavos : conCentavos).format(monto);
