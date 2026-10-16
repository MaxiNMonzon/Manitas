import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PresupuestarDto {
    @ApiProperty({ example: 15000 })
    @IsInt()
    @IsPositive()
    costo!: number;

    // Cuantas horas lleva el trabajo: con eso se reservan los turnos. Obligatorio en el primer
    // presupuesto; en un cambio de precio a mitad del trabajo no se manda
    @ApiPropertyOptional({ example: 3, description: 'Horas del trabajo (turnos de una hora). Obligatorio en el primer presupuesto.' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(200)
    horasTrabajo?: number;
}