import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class CreateSolicitudDeServicioDto {

    @IsString()
    estadoServicio!: string;

    @IsBoolean()
    visitaPrevia!: boolean;

    @IsDateString()
    fechaSolicitud!: string;

    @IsOptional()
    @IsDateString()
    fechaVisita?: string;

    @IsString()
    horaInicio!: string;

    @IsString()
    horaFinEstimada!: string;

    @IsInt()
    @IsPositive()
    duracionEstimada!: number;

    @IsOptional()
    @IsString()
    horaFinReal?: string;

    @IsInt()
    @IsPositive()
    costoEstimado!: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    costoFinal?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    calificacionServicio?: number;

    @IsOptional()
    @IsString()
    reseñaServicio?: string;

    @IsInt()
    @IsPositive()
    idMetodoPago!: number;

    @IsInt()
    @IsPositive()
    idCliente!: number;

    @IsInt()
    @IsPositive()
    idProfesional!: number;
}