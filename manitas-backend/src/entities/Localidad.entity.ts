export class Localidad {
  idLocalidad: number;
  codigoPostal: string;
  nombreLocalidad: string;
  provincia: string;

  // Relation one to many
  zonas: Zona[];

  constructor(
    idLocalidad: number,
    codigoPostal: string,
    nombreLocalidad: string,
    provincia: string
  ) {
    this.idLocalidad = idLocalidad;
    this.codigoPostal = codigoPostal;
    this.nombreLocalidad = nombreLocalidad;
    this.provincia = provincia;
    this.zonas = [];
  }

  agregarZona(zona: Zona): void {
    this.zonas.push(zona);
  }
}

import { Zona } from './Zona.entity';