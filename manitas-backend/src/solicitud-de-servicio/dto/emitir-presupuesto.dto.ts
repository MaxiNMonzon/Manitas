import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class EmitirPresupuestoDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  costoEstimado!: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  duracionEstimada!: number;

  @IsString()
  @IsNotEmpty()
  horaFinEstimada!: string;
}