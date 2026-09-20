import { IsEmail, IsNotEmpty } from 'class-validator';

export class SolicitarNuevaClaveDto {
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  @IsNotEmpty()
  correo!: string;
}