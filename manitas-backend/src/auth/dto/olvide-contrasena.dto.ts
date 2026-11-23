import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class OlvideContrasenaDto {
  @ApiProperty({ example: 'valeriagodoy.ros@gmail.com' })
  @IsEmail({}, { message: 'Ingresá un correo válido' })
  correo!: string;
}
