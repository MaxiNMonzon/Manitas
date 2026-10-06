import { IsInt, IsNotEmpty, IsPositive, IsString, Matches, Max, Min } from "class-validator";

export class CreateTarjetaDto {
    @IsString()
    @IsNotEmpty()
    alias!: string;

    @Matches(/^\d{4}$/, { message: 'ultimosDigitos tiene que ser de 4 numeros' })
    ultimosDigitos!: string;

    @IsInt()
    @Min(1)
    @Max(12)
    mesVencimiento!: number;

    @IsInt()
    @Min(2000)
    anioVencimiento!: number;

    @IsInt()
    @IsPositive()
    idMetodoDePago!: number;
}
