import { IsNotEmpty, IsNumber } from 'class-validator';

export class RehabilitarUsuarioDto {
  @IsNumber({}, { message: 'El ID del usuario debe ser un número válido' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  id!: number;
}