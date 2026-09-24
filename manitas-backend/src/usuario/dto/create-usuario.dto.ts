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
    @MinLength(8)         //la contraseña tiene una longitud mínima de 8 caracteres.
    contraseña!: string;
    
    @IsString()
    telefono!: string;

    @IsString()
    rol!: string;

}
