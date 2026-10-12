import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Max, Min } from "class-validator";

export class AgendarDto {
    // Fecha y hora juntas, ej: "2026-10-20T10:00:00"
    @ApiProperty({ example: '2026-10-20T10:00:00' })
    @IsDateString()
    fecha!: string;

    // Cuanto dura la visita o el trabajo, en minutos (si no se manda, 60).
    // Sirve para el calendario y para que no se pisen dos visitas del profesional
    @ApiPropertyOptional({ example: 90, description: 'En minutos, de 15 a 43200 (30 dias). Por defecto 60.' })
    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(43200)
    duracionEstimada?: number;
}
