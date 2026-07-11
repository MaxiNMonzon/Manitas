import { Localidad } from './Localidad';
import { Cliente } from './Cliente';
import { Profesional } from './Profesional';

export class Zona {
  idZona: number;
  nombreZona: string;
  localidad: Localidad;
  cliente: Cliente[];
  profesional: Profesional[];

  constructor(idZona: number, nombreZona: string, localidad: Localidad) {
    this.idZona = idZona;
    this.nombreZona = nombreZona;
    this.localidad = localidad;
    this.cliente = [];
    this.profesional = [];
  }
}
