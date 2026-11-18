import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CrearPreferenciaDto {
  // La solicitud que se va a pagar. El precio lo saca el back de la solicitud, no lo manda el front
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsPositive()
  idSolicitud!: number;
}
