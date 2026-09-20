import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateTiposDeServicioDto {

    @IsString()
    nombreServicio!: string;
    
    @IsString()
    descripcionServicio!: string;

    @IsInt()
    @IsPositive()    
    idEspecialidad!: number;
}
