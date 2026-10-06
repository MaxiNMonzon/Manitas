import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CalificarDto {
    // Estrellas del 1 al 5
    @IsInt()
    @Min(1)
    @Max(5)
    calificacionServicio!: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    reseñaServicio?: string;
}
