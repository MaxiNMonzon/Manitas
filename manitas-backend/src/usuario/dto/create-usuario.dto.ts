import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsString, MinLength } from "class-validator";

export class CreateUsuarioDto {

    @ApiProperty({ example: 38111222 })
    @IsInt()
    dni!:number

    @ApiProperty({ example: 'Sofia' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 'Perez' })
    @IsString()
    apellido!: string;

    @ApiProperty({ example: '1995-04-20' })
    @IsDateString()
    fechaNacimiento!: string;

    @ApiProperty({ example: 'sofia@mail.com' })
    @IsEmail()
    correo!: string;

    @ApiProperty({ example: 'clave1234' })
    @IsString()
    @MinLength(8)                //???????????????
    contraseña!: string;
    
    @ApiProperty({ example: '3411112222' })
    @IsString()
    telefono!: string;

}