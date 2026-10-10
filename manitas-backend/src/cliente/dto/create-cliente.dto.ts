import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateClienteDto extends CreateUsuarioDto {
  @ApiProperty({ example: 'Cordoba 1234' })
  @IsString()
  @MinLength(5)
  direccion!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  idZonaResidencia!: number;
}