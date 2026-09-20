import { IsInt, IsString, MinLength } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateClienteDto extends CreateUsuarioDto {
  @IsString()
  @MinLength(5)
  direccion!: string;

  @IsInt()
  idZonaResidencia!: number;
}