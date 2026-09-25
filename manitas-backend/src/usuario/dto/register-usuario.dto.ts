import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class RegisterUsuarioDto {
  @IsNumber()
  @IsNotEmpty()
  dni!: number;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contraseña!: string;

  @IsString()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  rol!: string; // ej: 'cliente' o 'profesional'
}