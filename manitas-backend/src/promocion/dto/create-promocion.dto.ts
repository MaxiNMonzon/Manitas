import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreatePromocionDto {

    @IsString()
    codigo!: string;

    @IsDateString()
    fechaInicioVigencia!: string;

    @IsDateString()
    fechaFinVigencia!: string;

    @IsNumber()
    @IsPositive()
    porcentajeDescuento!: number;

    @IsString()
    descripcion!: string;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    idsMetodosPago?: number[];
}