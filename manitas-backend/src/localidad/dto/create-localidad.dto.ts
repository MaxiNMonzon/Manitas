import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateLocalidadDto {
    
    @IsOptional()
    @IsString()
    codigoPostal?: string;

    @IsString()
    nombreLocalidad!: string;
    
    @IsInt()
    idProvincia!: number;
}
