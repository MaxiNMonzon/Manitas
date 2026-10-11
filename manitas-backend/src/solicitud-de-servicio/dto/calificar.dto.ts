import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CalificarDto {
    // Estrellas del 1 al 5
    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    calificacionServicio!: number;

    @ApiPropertyOptional({ example: 'Muy prolijo y llego puntual' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reseñaServicio?: string;
}