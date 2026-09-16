import { Localidad } from './Localidad';

export class Provincia {
  idProvincia: number;
  nombreProvincia: string;
  localidades: Localidad[];

  constructor(idProvincia: number, nombreProvincia: string) {
    this.idProvincia = idProvincia;
    this.nombreProvincia = nombreProvincia;
    this.localidades = [];
  }
  agregarLocalidad(local: Localidad): void {
    this.localidades.push(local);
  }
}