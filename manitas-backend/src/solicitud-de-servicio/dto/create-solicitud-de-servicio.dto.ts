import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateSolicitudDeServicioDto {

    @ApiProperty({ example: 'Gotea la canilla de la cocina y hace ruido' })
    @IsString()
    @IsNotEmpty()
    descripcionProblema!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idProfesional!: number;

    // La especialidad que necesita el cliente (el profesional tiene que hacerla)
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idEspecialidad!: number;
}