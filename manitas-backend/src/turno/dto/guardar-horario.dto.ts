import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';

export class HorarioDto {
  @ApiProperty({ example: 1, description: '0 = domingo, 1 = lunes, ..., 6 = sabado' })
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana!: number;

  @ApiProperty({ example: 9, description: 'Hora en que empieza (entera, de 0 a 23)' })
  @IsInt()
  @Min(0)
  @Max(23)
  horaDesde!: number;

  @ApiProperty({ example: 18, description: 'Hora en que termina (entera, de 1 a 24). El ultimo turno es una hora antes' })
  @IsInt()
  @Min(1)
  @Max(24)
  horaHasta!: number;
}

// Reemplaza todo el horario fijo del profesional. Una lista vacia = no trabaja ningun dia
export class GuardarHorarioDto {
  @ApiProperty({
    type: [HorarioDto],
    example: [
      { diaSemana: 1, horaDesde: 9, horaHasta: 18 },
      { diaSemana: 2, horaDesde: 9, horaHasta: 18 },
      { diaSemana: 6, horaDesde: 9, horaHasta: 13 },
    ],
  })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  horarios!: HorarioDto[];
}
