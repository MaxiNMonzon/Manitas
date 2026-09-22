import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateZonaDto {
  @IsString()
  nombreZona!: string;

  @IsInt()
  @IsPositive()
  idLocalidad!: number;

    //usuario
}