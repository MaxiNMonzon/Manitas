import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PresupuestarDto {
    // Dinero: admite centavos (hasta 2 decimales)
    @ApiProperty({ example: 15000.5 })
    @IsNumber({ maxDecimalPlaces: 2 })
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