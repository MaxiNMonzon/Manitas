import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

// GET /solicitud-de-servicio/agenda?desde=2026-10-01&hasta=2026-10-31 (los dos dias incluidos)
export class AgendaQueryDto {
  @ApiProperty({ example: '2026-10-01', description: 'Primer dia (AAAA-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'desde tiene que ser una fecha AAAA-MM-DD' })
  desde!: string;

  @ApiProperty({ example: '2026-10-31', description: 'Ultimo dia, incluido (AAAA-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hasta tiene que ser una fecha AAAA-MM-DD' })
  hasta!: string;
}