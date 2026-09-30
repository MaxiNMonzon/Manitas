import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register/cliente')
    registerCliente(@Body() createClienteDto: CreateClienteDto) {
        return this.authService.registerCliente(createClienteDto);
    }

    @Post('register/profesional')
    registerProfesional(@Body() createProfesionalDto: CreateProfesionalDto) {
        return this.authService.registerProfesional(createProfesionalDto);
    }

    @Post('login')
    login(){
        return this.authService.login();
    }
}