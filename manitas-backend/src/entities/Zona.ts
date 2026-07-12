import { Localidad } from './Localidad';
import { Profesional } from './Profesional';
import { Cliente } from './Cliente';

export class Zona {
  idZona: number;
  nombreZona: string;

  localidad: Localidad;
  clientes: Cliente[];
  profesionales: Profesional[];
  
  constructor(idZona: number, nombreZona: string, localidad: Localidad) {
    this.idZona = idZona;
    this.nombreZona = nombreZona;
    this.localidad = localidad;
    this.clientes = [];
    this.profesionales = [];
  }
  agregarCliente(cliente: Cliente): void {
    this.clientes.push(cliente);
  } 
  agregarProfesional(profesional: Profesional): void {
    this.profesionales.push(profesional);
  } 
}
