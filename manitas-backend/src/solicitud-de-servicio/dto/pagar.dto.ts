import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from "class-validator";

export class PagarDto {
    // Una de las tarjetas guardadas del cliente
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idTarjeta!: number;
}