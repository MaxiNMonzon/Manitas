export class Usuario {
        dni: number;
        nombre: string;
        apellido: string;
        correo: string;
        contraseña: string;
        telefono: number;
        rol: string;

        constructor(dni: number, nombre: string, apellido: string, correo: string, contraseña: string, telefono: number, rol: string) {
                this.dni = dni;
                this.nombre = nombre;
                this.apellido = apellido;
                this.correo = correo;
                this.contraseña = contraseña;
                this.telefono = telefono;
                this.rol = rol;
        }
}
        