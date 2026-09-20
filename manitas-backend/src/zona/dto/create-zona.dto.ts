import { IsInt, IsString } from 'class-validator';

export class CreateZonaDto {
  @IsString()
  nombreZona!: string;

  @IsInt()
  idLocalidad!: number;
}