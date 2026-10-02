import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class SolicitarServicioDto {
  @IsInt()
  @IsPositive()
  idCliente!: number;

  @IsInt()
  @IsPositive()
  idProfesional!: number;

  @IsInt()
  @IsPositive()
  idMetodoDePago!: number;

  @IsDateString({}, { message: 'La fecha de la solicitud debe ser una fecha válida' })
  fechaSolicitud!: string;

  @IsString()
  @IsNotEmpty()
  horaInicio!: string;

  @IsString()
  @IsNotEmpty()
  horaFinEstimada!: string;

  @IsInt()
  @IsPositive()
  duracionEstimada!: number;

  @IsInt()
  @IsPositive()
  costoEstimado!: number;

  @IsOptional()
  @IsBoolean()
  visitaPrevia?: boolean;
}