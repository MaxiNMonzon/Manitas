import { Profesional } from './Profesional';
import { TiposDeServicio } from './TiposDeServicio';

export class Especialidad {
  idEspecialidad: number;
  nombreEspecialidad: string;
  descripcionEspecialidad: string;

  profesionales: Profesional[];
  servicios: TiposDeServicio[];


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
  agregarServicio(servicio: TiposDeServicio): void {
    this.servicios.push(servicio);
  }
}
