import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AbonarServicioDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idMetodoDePago!: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  montoAbonado!: number;
}