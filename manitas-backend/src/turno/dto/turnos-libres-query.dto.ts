import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

// GET /turnos/libres/:idProfesional?desde=2026-10-20&hasta=2026-10-26 (los dos dias incluidos)
export class TurnosLibresQueryDto {
  @ApiProperty({ example: '2026-10-20', description: 'Primer dia (AAAA-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'desde tiene que ser una fecha AAAA-MM-DD' })
  desde!: string;

  @ApiProperty({ example: '2026-10-26', description: 'Ultimo dia, incluido (AAAA-MM-DD). Hasta 3 meses juntos' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hasta tiene que ser una fecha AAAA-MM-DD' })
  hasta!: string;
}
