import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class RestablecerContrasenaDto {
  // El codigo que llego en el link del mail
  @ApiProperty({ example: '3f9a...(64 letras y numeros)' })
  @IsString()
  @Length(64, 64, { message: 'El link no es válido' })
  codigo!: string;

  @ApiProperty({ example: 'claveNueva5678' })
  @IsString()
  @MinLength(8, { message: 'La contraseña tiene que tener al menos 8 caracteres' })
  contraseña!: string;
}