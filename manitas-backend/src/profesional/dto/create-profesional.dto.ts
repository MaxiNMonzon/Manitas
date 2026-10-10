import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
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

  // Habilidades: tipos de servicio que hace. Tienen que ser de alguna de sus especialidades
  @ApiPropertyOptional({ example: [1, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  idsTiposDeServicio?: number[];

  @ApiPropertyOptional({ example: 'Plomero matriculado con 10 años de experiencia. Trabajo prolijo y con garantia.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @ApiPropertyOptional({ example: '0000003100012345678901', description: 'CBU o CVU: 22 numeros' })
  @IsOptional()
  @Matches(/^\d{22}$/, { message: 'El CBU/CVU tiene que tener 22 numeros' })
  cbu?: string;
}