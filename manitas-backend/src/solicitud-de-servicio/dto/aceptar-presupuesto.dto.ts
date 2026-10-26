import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from "class-validator";

// Hay que mandar una de las dos cosas: o se hace en el momento, o desde cuando arranca el trabajo
export class AceptarPresupuestoDto {
    // true = trabajo chico, se hace ahora mismo en la visita (tiene que entrar en una hora)
    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    enElMomento?: boolean;

    // Trabajo para otro dia: desde que turno libre arranca. El sistema reserva las horas seguidas
    @ApiPropertyOptional({ example: '2026-10-22T09:00:00', description: 'Desde que turno arranca el trabajo (si no es en el momento)' })
    @IsOptional()
    @IsDateString()
    inicioTrabajo?: string;
}
