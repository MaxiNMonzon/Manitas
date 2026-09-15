import { IsEmail, IsInt, IsPositive, IsString, MinLength } from "class-validator";

export class CreateUsuarioDto {
    
    @IsInt()
    dni!:number

    @IsString()
    nombre!: string;
    
    @IsString()
    apellido!: string;
    
    @IsEmail()
    correo!: string;

    @IsString()
    @MinLength(8)                //???????????????
    contraseña!: string;
    
    @IsPositive()
    @IsInt()
    telefono!: number;

    @IsString()
    rol!: string;

}
