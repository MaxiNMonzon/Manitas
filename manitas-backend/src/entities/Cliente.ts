import { Usuario } from './Usuario';

export class Cliente extends Usuario {
    direccion: string;

        constructor(dni: number, nombre: string, apellido: string, correo: string, contraseña: string, telefono: number, rol: string, direccion: string) {
        super(dni, nombre, apellido, correo, contraseña, telefono, rol);
        this.direccion = direccion;
    }
}
