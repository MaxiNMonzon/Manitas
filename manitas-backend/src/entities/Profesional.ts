import { Especialidad } from './Especialidad';
import { Usuario } from './Usuario';
import { Zona } from './Zona';

export class Profesional extends Usuario {
    matricula: number;

    especialidades: Especialidad[];
    zonas: Zona[];

        constructor(dni: number, nombre: string, apellido: string, correo: string, contraseña: string, telefono: number, rol: string, matricula: number) {
        super(dni, nombre, apellido, correo, contraseña, telefono, rol);
        this.matricula = matricula;
        this.especialidades = [];
        this.zonas = [];
    }
  agregarEspecialidad(especialidad: Especialidad): void {
    this.especialidades.push(especialidad);
    }
  agregarZona(zona: Zona): void {
    this.zonas.push(zona);
    }
}