import { resumirCobros } from './resumen-cobros';
import type { Cobro } from './solicitud-de-servicio.service';

// Un cobro como los que arma SolicitudDeServicioService.cobros()
function cobro(datos: Partial<Cobro>): Cobro {
  return {
    idSolicitud: 1,
    concepto: 'trabajo',
    estado: 'cobrado',
    monto: 10000,
    fechaPago: null,
    depositoEstimado: null,
    medioDePago: 'Mercado Pago',
    especialidad: 'Plomería',
    descripcionProblema: 'Pierde la canilla',
    cliente: { nombre: 'Valeria', apellido: 'Godoy' },
    fechaServicio: null,
    ...datos,
  };
}

describe('resumirCobros (las cuentas de Mis cobros se hacen en el back)', () => {
  const ahora = new Date(2026, 10, 20, 12, 0); // 20/11/2026

  it('suma los ingresos del mes y calcula cuánto cambió respecto del anterior', () => {
    const r = resumirCobros(
      [
        cobro({ monto: 20000, fechaPago: new Date(2026, 9, 10) }), // octubre
        cobro({ monto: 30000, fechaPago: new Date(2026, 10, 5) }), // noviembre
        cobro({ monto: 10000, fechaPago: new Date(2026, 10, 15), concepto: 'visita' }),
      ],
      ahora,
    );
    expect(r.mesActual).toBe('2026-11');
    expect(r.ingresosMes).toBe(40000);
    expect(r.variacionMes).toBe(100); // de 20.000 a 40.000
    const noviembre = r.meses.find((m) => m.mes === '2026-11')!;
    expect(noviembre).toMatchObject({ trabajos: 30000, visitas: 10000, cantidad: 2, total: 40000 });
  });

  it('sin cobros el mes anterior, la variación es null (no se divide por cero)', () => {
    const r = resumirCobros([cobro({ monto: 5000, fechaPago: new Date(2026, 10, 2) })], ahora);
    expect(r.variacionMes).toBeNull();
    // Siempre están al menos los últimos 6 meses (para el historial), aunque estén vacíos
    expect(r.meses.map((m) => m.mes)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
  });

  it('el pendiente suma lo no pagado y lo pagado sin depositar, y da el próximo depósito', () => {
    const r = resumirCobros(
      [
        cobro({ monto: 45000, estado: 'pendiente_cobro' }), // el cliente todavía no pagó
        cobro({ monto: 8000, estado: 'pendiente_cobro', fechaPago: new Date(2026, 10, 19), depositoEstimado: new Date(2026, 10, 24) }),
        cobro({ monto: 9000, estado: 'pendiente_cobro', fechaPago: new Date(2026, 10, 18), depositoEstimado: new Date(2026, 10, 23) }),
      ],
      ahora,
    );
    expect(r.pendiente.monto).toBe(62000);
    expect(r.pendiente.cantidad).toBe(3);
    expect(r.pendiente.proximoDeposito).toEqual(new Date(2026, 10, 23));
    // En la barra del mes, lo que no se pagó cuenta en el mes actual
    expect(r.meses[r.meses.length - 1].pendiente).toBe(62000);
  });

  it('el promedio por trabajo y las tortas son de los últimos 6 meses', () => {
    const r = resumirCobros(
      [
        cobro({ monto: 30000, fechaPago: new Date(2026, 9, 1), especialidad: 'Gas' }),
        cobro({ monto: 10000, fechaPago: new Date(2026, 10, 1) }),
        cobro({ monto: 99000, fechaPago: new Date(2026, 0, 1) }), // enero: queda afuera
      ],
      ahora,
    );
    expect(r.promedioPorTrabajo).toEqual({ monto: 20000, trabajos: 2, meses: 6 });
    expect(r.porEspecialidad).toEqual([
      { nombre: 'Gas', monto: 30000, porcentaje: 75 },
      { nombre: 'Plomería', monto: 10000, porcentaje: 25 },
    ]);
  });
});
