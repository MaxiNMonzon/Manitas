import { Localidad } from './Localidad.entity';

export class Zona {
  idZona: number;
  nombreZona: string;

  // Relation one to many
  localidad: Localidad;

  constructor(
    idZona: number,
    nombreZona: string,
    localidad: Localidad
  ) {
    this.idZona = idZona;
    this.nombreZona = nombreZona;
    this.localidad = localidad;
  }
}