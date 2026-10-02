import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class SolicitarPresupuestoDto {
  @IsInt()
  @IsPositive()
  idCliente!: number;

  @IsInt()
  @IsPositive()
  idProfesional!: number;

  @IsBoolean()
  visitaPrevia!: boolean;

  @IsOptional()
  @IsDateString()
  fechaVisita?: string;

  @IsDateString()
  fechaSolicitud!: string;

  @IsString()
  horaInicio!: string;

  @IsOptional()
  @IsString()
  horaFinEstimada?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  duracionEstimada?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  costoEstimado?: number;

  @IsInt()
  @IsPositive()
  idMetodoDePago!: number;
}