import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateConsultaDto {
  @ApiProperty({ example: 'laura@gmail.com', description: 'A donde contestarle' })
  @IsEmail({}, { message: 'Ingresa un correo valido' })
  @MaxLength(120)
  correo!: string;

  @ApiProperty({ example: 'Pagos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  tema!: string;

  @ApiProperty({ example: 'Pague con Mercado Pago pero la solicitud sigue figurando sin pagar.' })
  @IsString()
  @MinLength(10, { message: 'Contanos un poco mas (al menos 10 letras)' })
  @MaxLength(2000)
  mensaje!: string;

  // El rol y el correo de la cuenta no se mandan: el back los saca del token
}
