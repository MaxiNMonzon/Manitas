import { Usuario } from './Usuario';
import { Zona } from './Zona';

export class Cliente extends Usuario {
    direccion: string;
    zonas: Zona[];

        constructor(dni: number, nombre: string, apellido: string, correo: string, contraseña: string, telefono: number, rol: string, direccion: string) {
        super(dni, nombre, apellido, correo, contraseña, telefono, rol);
        this.direccion = direccion;
        this.zonas = [];
    }
  agregarZona(zona: Zona): void {
    this.zonas.push(zona);
    }    
}
