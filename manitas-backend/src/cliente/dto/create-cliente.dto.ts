import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateClienteDto extends CreateUsuarioDto {
  @ApiProperty({ example: 'Cordoba' })
  @IsString()
  @IsNotEmpty()
  calle!: string;

  @ApiProperty({ example: 1234 })
  @IsInt()
  @IsPositive()
  altura!: number;

  // Piso y depto solo si vive en un departamento
  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  piso?: string;

  @ApiPropertyOptional({ example: 'B' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  depto?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  idZonaResidencia!: number;
}