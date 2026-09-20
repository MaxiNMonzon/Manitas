import { Zona } from './Zona';

export class Localidad {
  idLocalidad: number;
  codigoPostal: string;
  nombreLocalidad: string;
  provincia: string;

  zonas: Zona[];

  constructor(
    idLocalidad: number,
    codigoPostal: string,
    nombreLocalidad: string,
    provincia: string,
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
