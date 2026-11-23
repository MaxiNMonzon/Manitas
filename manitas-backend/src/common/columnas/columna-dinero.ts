import { ColumnOptions } from 'typeorm';

// Las columnas de dinero van en DECIMAL (no en entero ni en float): guardan los centavos
// exactos, sin errores de redondeo. DECIMAL(12,2) = hasta 9.999.999.999,99.
// MySQL devuelve los DECIMAL como texto ("15000.50"); el transformer los convierte a number
// al leerlos, así el resto del código sigue trabajando con números.
export const columnaDinero: ColumnOptions = {
  type: 'decimal',
  precision: 12,
  scale: 2,
  nullable: true,
  transformer: {
    to: (valor?: number | null) => valor,
    from: (valor?: string | null) => (valor == null ? null : Number(valor)),
  },
};
