import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CalificarServicioDto {
  @IsNotEmpty({ message: 'La calificación es obligatoria' })
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  calificacion!: number;

  @IsOptional()
  @IsString({ message: 'La reseña debe ser una cadena de texto' })
  reseña?: string;
}