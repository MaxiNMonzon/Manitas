import { IsArray, ArrayMinSize, IsInt, IsOptional, IsString } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfesionalDto extends CreateUsuarioDto {
  @IsOptional()
  @IsString()
  nroMatricula?: string;

  @IsInt()
  idProvinciaOperacion!: number;

  // Esto es un array de números de zonas
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  idsZonasCobertura!: number[];
}