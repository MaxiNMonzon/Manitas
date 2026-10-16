import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from "class-validator";

// El horario nuevo que se propone (uno de los turnos libres del profesional).
// Si es el trabajo, es desde cuando arranca: se reservan las mismas horas seguidas
export class ReprogramarDto {
    @ApiProperty({ example: '2026-10-21T15:00:00' })
    @IsDateString()
    inicio!: string;
}