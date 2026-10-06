import { IsArray, ArrayMinSize, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfesionalDto extends CreateUsuarioDto {
  @IsOptional()
  @IsString()
  nroMatricula?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  costoVisita?: number;

  // Esto es un array de números de zonas
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  idsZonasCobertura!: number[];
}