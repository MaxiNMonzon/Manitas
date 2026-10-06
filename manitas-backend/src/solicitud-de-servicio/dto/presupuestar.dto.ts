import { IsInt, IsPositive } from "class-validator";

export class PresupuestarDto {
    @IsInt()
    @IsPositive()
    costo!: number;
}