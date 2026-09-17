import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateEspecialidadDto {

    @IsString()
    nombreEspecialidad!: string;

    @IsString()
    descripcionEspecialidad!: string;
    
}