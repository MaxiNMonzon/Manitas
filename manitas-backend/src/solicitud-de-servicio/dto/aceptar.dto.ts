import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class AceptarDto {
    // Solo en una urgente (obligatorio ahi): en cuantos minutos llega el profesional.
    // Una urgente no se agenda, es en el dia: con esto queda la visita y se le avisa al cliente
    @ApiPropertyOptional({ example: 30, description: 'Solo urgentes: en cuantos minutos llegas, de 5 a 240.' })
    @IsOptional()
    @IsInt()
    @Min(5)
    @Max(240)
    minutosLlegada?: number;
}
