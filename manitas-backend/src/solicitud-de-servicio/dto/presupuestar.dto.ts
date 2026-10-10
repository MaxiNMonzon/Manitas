import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from "class-validator";

export class PresupuestarDto {
    @ApiProperty({ example: 15000 })
    @IsInt()
    @IsPositive()
    costo!: number;
}
