import { formatoPesos, mismoMonto, redondearCentavos, sumarMontos } from './dinero';

// El espacio que pone Intl entre el $ y el número es uno "duro" (no separable): se normaliza para comparar
const texto = (monto: number) => formatoPesos(monto).replace(/\s/g, ' ');

describe('dinero', () => {
  it('suma con centavos sin errores de decimales', () => {
    expect(0.1 + 0.2).not.toBe(0.3); // el problema que se evita
    expect(sumarMontos([0.1, 0.2])).toBe(0.3);
    expect(sumarMontos([15000.5, 2500.25, 0.25])).toBe(17501);
    expect(sumarMontos([])).toBe(0);
  });

  it('redondea a centavos', () => {
    expect(redondearCentavos(10000 / 3)).toBe(3333.33);
    expect(redondearCentavos(45000)).toBe(45000);
  });

  it('compara montos hasta el centavo', () => {
    expect(mismoMonto(45000.5, 45000.5)).toBe(true);
    expect(mismoMonto(0.1 + 0.2, 0.3)).toBe(true);
    expect(mismoMonto(45000.5, 45000.51)).toBe(false);
  });

  it('muestra los centavos solo cuando hay', () => {
    expect(texto(45000)).toBe('$ 45.000');
    expect(texto(45000.5)).toBe('$ 45.000,50');
    expect(texto(0.05)).toBe('$ 0,05');
  });
});