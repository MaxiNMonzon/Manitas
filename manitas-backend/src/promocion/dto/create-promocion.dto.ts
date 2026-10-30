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

    @ApiProperty({ example: 'Tope $20.000 mensual · Crédito y débito Visa y Mastercard', description: 'Corta: el tope y con qué tarjetas (el banco y el porcentaje ya se muestran aparte)' })
    @IsString()
    descripcion!: string;

    @ApiPropertyOptional({ example: [2] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    idsMetodosPago?: number[];
}
