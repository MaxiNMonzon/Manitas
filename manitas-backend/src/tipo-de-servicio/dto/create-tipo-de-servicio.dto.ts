import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateTipoDeServicioDto {

    @IsString()
    nombreServicio!: string;
    
    @IsString()
    descripcionServicio!: string;

    @IsInt()
    @IsPositive()    
    idEspecialidad!: number;
}
