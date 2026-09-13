import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateEspecialidadDto {

    @IsString()
    nombreEspecialidad!: string;

    @IsString()
    descripcionEspecialidad!: string;
    
    @IsInt()
    @IsPositive()
    idServicio!: number;
    
    @IsInt()
    @IsPositive()
    idProfesional!: number;

}
