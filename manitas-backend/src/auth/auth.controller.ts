import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

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

    @Post('login/cliente')
    loginCliente(@Body() loginDto: LoginDto) {
        return this.authService.loginCliente(loginDto);
    }

    @Post('login/profesional')
    loginProfesional(@Body() loginDto: LoginDto) {
        return this.authService.loginProfesional(loginDto);
    }

    @Post('login/admin')
    loginAdmin(@Body() loginDto: LoginDto) {
        return this.authService.loginAdmin(loginDto);
    }

    @Get('perfil')
    @UseGuards(AuthGuard)
    perfil(@UsuarioActivo() usuario: UsuarioActivoInterface) {
        return this.authService.perfil(usuario);
    }
}
