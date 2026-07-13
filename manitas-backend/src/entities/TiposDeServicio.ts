import { Especialidad } from './Especialidad';

export class TiposDeServicio {
  idServicio: number;
  nombreServicio: string;
  descripcionServicio: string;

  especialidad: Especialidad;

  constructor(idServicio: number, nombreServicio: string, descripcionServicio: string, especialidad: Especialidad) {
    this.idServicio = idServicio;
    this.nombreServicio = nombreServicio;
    this.descripcionServicio = descripcionServicio;
    this.especialidad = especialidad;
  }
}