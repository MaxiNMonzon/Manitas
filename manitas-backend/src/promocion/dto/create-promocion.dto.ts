import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreatePromocionDto {

    @ApiProperty({ example: 'GALICIA30' })
    @IsString()
    codigo!: string;

    @ApiProperty({ example: '2026-10-01' })
    @IsDateString()
    fechaInicioVigencia!: string;

    @ApiProperty({ example: '2026-10-31' })
    @IsDateString()
    fechaFinVigencia!: string;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @IsPositive()
    porcentajeDescuento!: number;

    @ApiProperty({ example: '30% de reintegro con Visa y Mastercard del Banco Galicia (tope de $20.000)', description: 'Si la promo tiene tope de reintegro, se aclara aca' })
    @IsString()
    descripcion!: string;

    @ApiPropertyOptional({ example: [2] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    idsMetodosPago?: number[];
}