import { Rol } from '../enums/rol.enum';

export interface UsuarioActivoInterface {
  sub: number;
  correo: string;
  rol: Rol;
}
