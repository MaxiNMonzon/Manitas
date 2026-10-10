import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from "class-validator";

export class AgendarDto {
    // Fecha y hora juntas, ej: "2026-10-20T10:00:00"
    @ApiProperty({ example: '2026-10-20T10:00:00' })
    @IsDateString()
    fecha!: string;
}
