import { Zona } from './Zona';
import { Provincia } from './Provincia';

export class Localidad {
  idLocalidad: number;
  codigoPostal: string;
  nombreLocalidad: string;

  provincia: Provincia;

  zonas: Zona[];

  constructor(
    idLocalidad: number,
    codigoPostal: string,
    nombreLocalidad: string,
    provincia: Provincia,
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