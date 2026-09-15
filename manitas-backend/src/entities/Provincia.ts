import { Localidad } from './Localidad';

export class Provincia {
  idProvincia: number;
  nombreProvincia: string;
  localidad: Localidad[];

  constructor(idProvincia: number, nombreProvincia: string) {
    this.idProvincia = idProvincia;
    this.nombreProvincia = nombreProvincia;
    this.localidad = [];
  }
  agregarLocalidad(local: Localidad): void {
    this.localidad.push(local);
  }
}
