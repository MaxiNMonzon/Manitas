import type { Cobro } from './solicitud-de-servicio.service';
import { redondearCentavos, sumarMontos } from '../common/dinero';

// Las cuentas de "Mis cobros" del profesional. Las hace el back (no el front): sumas, promedios,
// cuánto cambió de un mes a otro y los porcentajes de los gráficos. Son funciones puras (se testean solas).
// Los montos tienen centavos: se suman con sumarMontos para que no aparezcan errores de decimales.

export const MESES_HISTORIAL = 6;

export interface CobrosDelMes {
  mes: string; // "2026-11"
  trabajos: number; // lo cobrado por trabajos ese mes
  visitas: number; // lo cobrado por visitas ese mes
  cantidad: number; // cuántos pagos hubo
  total: number; // lo cobrado en total (trabajos + visitas)
  variacion: number | null; // % respecto del mes anterior (null si el anterior no tuvo cobros)
  // Toda la plata del mes según en qué está: los que esperan el pago cuentan en el mes actual
  cobrado: number;
  pendiente: number;
}

export interface Porcion {
  nombre: string;
  monto: number;
  porcentaje: number;
}

export interface ResumenCobros {
  mesActual: string;
  ingresosMes: number;
  variacionMes: number | null; // % respecto del mes anterior
  pendiente: { monto: number; cantidad: number; proximoDeposito: Date | null };
  promedioPorTrabajo: { monto: number; trabajos: number; meses: number };
  // Un renglón por mes hasta el actual: desde el primer cobro, y como mínimo los últimos 6 (el historial)
  meses: CobrosDelMes[];
  // Los últimos 6 meses, para las tortas
  porEspecialidad: Porcion[];
  porMedioDePago: Porcion[];
}

// "2026-11"
export const claveMes = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

const suma = (cobros: Cobro[]) => sumarMontos(cobros.map((cobro) => cobro.monto));
const pagados = (cobros: Cobro[]) => cobros.filter((cobro) => cobro.fechaPago != null);
const variacion = (actual: number, anterior: number) => (anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : null);

// Suma los montos por una clave (ej: especialidad), de mayor a menor, con el porcentaje de cada uno
function porciones(cobros: Cobro[], clave: (cobro: Cobro) => string): Porcion[] {
  const sumas = new Map<string, number>();
  for (const cobro of cobros) sumas.set(clave(cobro), sumarMontos([sumas.get(clave(cobro)) ?? 0, cobro.monto]));
  const total = suma(cobros);
  return [...sumas.entries()]
    .map(([nombre, monto]) => ({ nombre, monto, porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0 }))
    .sort((uno, otro) => otro.monto - uno.monto);
}

export function resumirCobros(cobros: Cobro[], ahora: Date): ResumenCobros {
  const mesActual = claveMes(ahora);
  const conPago = pagados(cobros);

  // Desde el primer mes con un pago (o desde hace 6 meses, si es más cerca) hasta el actual
  const inicioActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const desde = new Date(ahora.getFullYear(), ahora.getMonth() - (MESES_HISTORIAL - 1), 1);
  const primerPago = conPago.reduce<Date>((masViejo, cobro) => (cobro.fechaPago! < masViejo ? cobro.fechaPago! : masViejo), desde);
  const meses: CobrosDelMes[] = [];
  for (let mes = new Date(primerPago.getFullYear(), primerPago.getMonth(), 1); mes <= inicioActual; mes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1)) {
    const clave = claveMes(mes);
    const delMes = conPago.filter((cobro) => claveMes(cobro.fechaPago!) === clave);
    // Para la barra del mes: los que esperan el pago se muestran en el mes actual
    const todosDelMes = cobros.filter((cobro) => (cobro.fechaPago == null ? clave === mesActual : claveMes(cobro.fechaPago) === clave));
    const total = suma(delMes);
    meses.push({
      mes: clave,
      trabajos: suma(delMes.filter((cobro) => cobro.concepto === 'trabajo')),
      visitas: suma(delMes.filter((cobro) => cobro.concepto === 'visita')),
      cantidad: delMes.length,
      total,
      variacion: meses.length ? variacion(total, meses[meses.length - 1].total) : null,
      cobrado: suma(todosDelMes.filter((cobro) => cobro.estado === 'cobrado')),
      pendiente: suma(todosDelMes.filter((cobro) => cobro.estado === 'pendiente_cobro')),
    });
  }

  // Pendiente de cobro: lo que el cliente todavía no pagó y lo que pagó pero falta depositar
  const pendientes = cobros.filter((cobro) => cobro.estado === 'pendiente_cobro');
  const depositos = pendientes.filter((cobro) => cobro.depositoEstimado).map((cobro) => cobro.depositoEstimado!);
  const proximoDeposito = depositos.length ? new Date(Math.min(...depositos.map((deposito) => deposito.getTime()))) : null;

  // Los últimos 6 meses (promedio y tortas)
  const recientes = conPago.filter((cobro) => cobro.fechaPago! >= desde);
  const trabajosRecientes = recientes.filter((cobro) => cobro.concepto === 'trabajo');

  const esteMes = meses[meses.length - 1];
  return {
    mesActual,
    ingresosMes: esteMes.total,
    variacionMes: esteMes.variacion,
    pendiente: { monto: suma(pendientes), cantidad: pendientes.length, proximoDeposito },
    promedioPorTrabajo: {
      monto: trabajosRecientes.length ? redondearCentavos(suma(trabajosRecientes) / trabajosRecientes.length) : 0,
      trabajos: trabajosRecientes.length,
      meses: MESES_HISTORIAL,
    },
    meses,
    porEspecialidad: porciones(recientes, (cobro) => cobro.especialidad ?? 'Otras'),
    porMedioDePago: porciones(recientes, (cobro) => cobro.medioDePago ?? 'Mercado Pago'),
  };
}
