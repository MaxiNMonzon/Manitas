import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {

    @ApiProperty({ example: 'sofia@mail.com' })
    @IsEmail()
    correo!: string;

    @ApiProperty({ example: 'clave1234' })
    @IsString()
    @MinLength(8)
    contraseña!: string;
}
