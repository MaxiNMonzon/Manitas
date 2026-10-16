import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

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

    // El turno que elige el cliente para la visita (uno de los libres del profesional, en punto)
    @ApiProperty({ example: '2026-10-20T10:00:00', description: 'Inicio del turno de la visita (uno de los turnos libres del profesional)' })
    @IsDateString()
    inicioTurno!: string;
}
