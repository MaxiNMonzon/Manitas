import { Profesional } from './Profesional';
import { Especialidad } from './Especialidad';

export class PrecioBase {
  precio: number;
  fechaDesde: Date;
  profesional: Profesional;
  especialidad: Especialidad;

  constructor(precio: number, fechaDesde: Date, profesional: Profesional, especialidad: Especialidad) {
    this.precio = precio;
    this.fechaDesde = fechaDesde;
    this.profesional = profesional;
    this.especialidad = especialidad;
  }
}