import { MetodoDePago } from './MetodoDePago';

export class Promocion {
  codigo: number;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;
  descuento: number;
  descripcion: string;
  metododepago: MetodoDePago[];

  constructor(
    codigo: number,
    fechaInicioVigencia: Date,
    fechaFinVigencia: Date,
    descuento: number,
    descripcion: string,
  ) {
    this.codigo = codigo;
    this.fechaInicioVigencia = fechaInicioVigencia;
    this.fechaFinVigencia = fechaFinVigencia;
    this.descuento = descuento;
    this.descripcion = descripcion;
    this.metododepago = [];
  }
  agregarPago(pago: MetodoDePago): void {
    this.metododepago.push(pago);
  }
}