import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RestablecerClaveDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  nuevaClave!: string;
}