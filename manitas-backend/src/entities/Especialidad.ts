import { Profesional } from './Profesional';
import { TipoDeServicio } from './TipoDeServicio';

export class Especialidad {
  idEspecialidad: number;
  nombreEspecialidad: string;
  descripcionEspecialidad: string;

  profesionales: Profesional[];
  servicios: TipoDeServicio[];


  constructor(idEspecialidad: number, nombreEspecialidad: string, descripcionEspecialidad: string) {
    this.idEspecialidad = idEspecialidad;
    this.nombreEspecialidad = nombreEspecialidad;
    this.descripcionEspecialidad = descripcionEspecialidad;
    this.profesionales = [];
    this.servicios = [];
  }
  agregarProfesional(profesional: Profesional): void {
    this.profesionales.push(profesional);
  }
  agregarServicio(servicio: TipoDeServicio): void {
    this.servicios.push(servicio);
  }
}