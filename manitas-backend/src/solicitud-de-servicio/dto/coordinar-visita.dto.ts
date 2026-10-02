import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CoordinarVisitaDto {
  @IsNotEmpty({ message: 'La fecha de la visita es obligatoria' })
  @IsDateString({}, { message: 'La fecha de la visita debe ser una fecha válida' })
  fechaVisita!: string;

  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser un texto en formato HH:mm' })
  horaInicio!: string;
}