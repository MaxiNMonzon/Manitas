import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ConfirmarServicioDto {
  @IsOptional()
  @IsDateString()
  fechaVisita?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}