import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico obligatorio' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contraseña!: string;
}