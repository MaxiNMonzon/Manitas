import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateSolicitudDeServicioDto {

    @IsString()
    @IsNotEmpty()
    descripcionProblema!: string;

    @IsInt()
    @IsPositive()
    idProfesional!: number;
}
