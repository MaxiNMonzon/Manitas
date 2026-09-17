import { IsInt, IsString } from "class-validator";

export class CreateLocalidadDto {
    
    @IsString()
    codigoPostal!: string;

    @IsString()
    nombreLocalidad!: string;
    
    @IsInt()
    idProvincia!: number;
}