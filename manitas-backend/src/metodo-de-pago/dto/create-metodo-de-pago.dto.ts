import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateMetodoDePagoDto {

    @IsString()
    tipo!: string;

    @IsString()
    estado!: string;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    idsPromociones?: number[];
}