import { IsInt, IsPositive } from "class-validator";

export class PagarDto {
    // Una de las tarjetas guardadas del cliente
    @IsInt()
    @IsPositive()
    idTarjeta!: number;
}