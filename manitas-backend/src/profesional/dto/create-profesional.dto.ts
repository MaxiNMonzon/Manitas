import { IsOptional, IsString } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfesionalDto extends CreateUsuarioDto {
  @IsOptional()
  @IsString()
  nroMatricula?: string;
}
