import {
  IsEmail,
  IsString,
  MinLength,
  IsDateString,
  IsNumberString,
  Length,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNumberString({}, { message: 'El DNI debe contener solo números' })
  @Length(7, 9, { message: 'El DNI debe tener entre 7 y 9 dígitos' })
  dni!: string;

  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsString()
  @MinLength(1)
  apellido!: string;

  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)',
    },
  )
  fechaNacimiento!: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  correo!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contraseña!: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MinLength(8, { message: 'El teléfono debe tener al menos 8 caracteres' })
  @MaxLength(15, { message: 'El teléfono no puede superar los 15 caracteres' })
  telefono!: string;
}
