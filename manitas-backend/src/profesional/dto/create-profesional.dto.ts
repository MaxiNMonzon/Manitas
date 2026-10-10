import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfesionalDto extends CreateUsuarioDto {
  @ApiPropertyOptional({ example: 'MAT-4521' })
  @IsOptional()
  @IsString()
  nroMatricula?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  costoVisita?: number;

  // Esto es un array de números de zonas
  @ApiProperty({ example: [1,2] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  idsZonasCobertura!: number[];

  // Lo mismo con las especialidades que hace
  @ApiProperty({ example: [1] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  idsEspecialidades!: number[];
}