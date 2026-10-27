import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @ApiPropertyOptional({ enum: ['cliente', 'profesional', 'visitante'], example: 'cliente' })
  @IsOptional()
  @IsIn(['cliente', 'profesional', 'visitante'])
  rol?: 'cliente' | 'profesional' | 'visitante';

  @ApiPropertyOptional({ example: 'laura.cliente@manitas.test', description: 'El correo de su cuenta, si tiene sesion' })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  correoCuenta?: string;
}