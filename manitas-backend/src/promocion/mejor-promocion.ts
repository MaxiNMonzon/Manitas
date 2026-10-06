import { Promocion } from './entities/promocion.entity';

// TypeORM devuelve las columnas 'date' como texto ("2026-10-05").
// new Date("2026-10-05") lo toma como medianoche en UTC, que en Argentina es el dia anterior,
// por eso se arma la fecha a mano con año, mes y dia en hora local
function fechaLocal(fecha: Date | string, hora: number, minutos: number, segundos: number) {
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia, hora, minutos, segundos);
}

// De una lista de promociones, la vigente hoy con mayor descuento (o null si no hay).
// La usan pagar y la lista de tarjetas con promo
export function mejorPromocionVigente(promociones: Promocion[]): Promocion | null {
  const hoy = new Date();
  let mejor: Promocion | null = null;

  for (const promocion of promociones) {
    const inicio = fechaLocal(promocion.fechaInicioVigencia, 0, 0, 0);
    const fin = fechaLocal(promocion.fechaFinVigencia, 23, 59, 59);
    const vigente = inicio <= hoy && hoy <= fin;

    if (vigente && (!mejor || Number(promocion.porcentajeDescuento) > Number(mejor.porcentajeDescuento))) {
      mejor = promocion;
    }
  }
  return mejor;
}