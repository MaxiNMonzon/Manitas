import { IsBoolean } from "class-validator";

export class AceptarPresupuestoDto {
    // true = trabajo chico, se hace en el momento de la visita
    // false = trabajo grande, hay que coordinar otra fecha
    @IsBoolean()
    enElMomento!: boolean;
}
