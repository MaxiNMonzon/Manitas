import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class MatriculaDto {
  @ApiProperty({ example: 'MP-4521' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numero!: string;

  @ApiPropertyOptional({ example: 'Gasista de 1ra categoria - ENARGAS' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  // Tiene que ser una de las especialidades del profesional
  @ApiProperty({ example: 2 })
  @IsInt()
  idEspecialidad!: number;
}