import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from "class-validator";

export class CambiarContrasenaDto {

    // Se pide la actual para que nadie la cambie con una sesion abierta ajena
    @ApiProperty({ example: 'clave1234' })
    @IsString()
    contraseñaActual!: string;

    @ApiProperty({ example: 'claveNueva5678' })
    @IsString()
    @MinLength(8)
    contraseñaNueva!: string;
}