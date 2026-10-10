import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreatePromocionDto {

    @ApiProperty({ example: 'VISA20' })
    @IsString()
    codigo!: string;

    @ApiProperty({ example: '2026-10-01' })
    @IsDateString()
    fechaInicioVigencia!: string;

    @ApiProperty({ example: '2026-10-31' })
    @IsDateString()
    fechaFinVigencia!: string;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @IsPositive()
    porcentajeDescuento!: number;

    @ApiProperty({ example: '20% de reintegro con Visa credito' })
    @IsString()
    descripcion!: string;

    @ApiPropertyOptional({ example: [2] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    idsMetodosPago?: number[];
}
