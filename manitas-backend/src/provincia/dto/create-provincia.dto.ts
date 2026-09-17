import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateProvinciaDto {

    @IsString()
    nombreProvincia!: string;
    

}