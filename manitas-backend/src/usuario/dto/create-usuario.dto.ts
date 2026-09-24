import { IsDateString, IsEmail, IsInt, IsString, MinLength } from "class-validator";

export class CreateUsuarioDto {

    @IsInt()
    dni!:number

    @IsString()
    nombre!: string;

    @IsString()
    apellido!: string;

    @IsDateString()
    fechaNacimiento!: string;

    @IsEmail()
    correo!: string;

    @IsString()
    @MinLength(8)                //???????????????
    contraseña!: string;
    
    @IsString()
    telefono!: string;

}
