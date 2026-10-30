import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateEspecialidadDto {

    @IsString()
    nombreEspecialidad!: string;

    @IsString()
    descripcionEspecialidad!: string;

    @ApiPropertyOptional({ example: 'caño, canilla, pérdida, inodoro, destapar', description: 'Separadas por coma' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    palabrasClave?: string;

}