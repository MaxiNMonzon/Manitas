import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Matches, Max, Min } from "class-validator";

export class CreateTarjetaDto {
    @ApiProperty({ example: 'Mi Visa' })
    @IsString()
    @IsNotEmpty()
    alias!: string;

    @ApiProperty({ example: '4321' })
    @Matches(/^\d{4}$/, { message: 'ultimosDigitos tiene que ser de 4 numeros' })
    ultimosDigitos!: string;

    @ApiProperty({ example: 8 })
    @IsInt()
    @Min(1)
    @Max(12)
    mesVencimiento!: number;

    @ApiProperty({ example: 2029 })
    @IsInt()
    @Min(2000)
    anioVencimiento!: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    @IsPositive()
    idMetodoDePago!: number;
}