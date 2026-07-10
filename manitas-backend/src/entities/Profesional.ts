import { Usuario } from './Usuario';

export class Profesional extends Usuario {
    matricula: number;

        constructor(dni: number, nombre: string, apellido: string, correo: string, contraseña: string, telefono: number, rol: string, matricula: number) {
        super(dni, nombre, apellido, correo, contraseña, telefono, rol);
        this.matricula = matricula;
    }
}
