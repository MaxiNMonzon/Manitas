import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';

export class OlvideContrasenaDto {
  @ApiProperty({ example: 'valeriagodoy.ros@gmail.com' })
  @IsEmail({}, { message: 'Ingresá un correo válido' })
  correo!: string;

  @ApiProperty({ enum: ['cliente', 'profesional'], example: 'cliente' })
  @IsIn(['cliente', 'profesional'], { message: 'El rol tiene que ser cliente o profesional' })
  rol!: 'cliente' | 'profesional';
}
