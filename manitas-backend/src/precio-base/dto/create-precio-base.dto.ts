import { IsInt, IsPositive, IsDateString } from "class-validator";

export class CreatePrecioBaseDto {
    
        @IsInt()
        @IsPositive()
        precio!: number;
    
        @IsDateString()
        fechaDesde!: string;
        
        @IsInt()
        @IsPositive()
        idEspecialidad!: number;

        @IsInt()
        @IsPositive()
        idProfesional!: number;
}
