import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register/cliente')
    @ApiOperation({ summary: 'Registrarse como cliente' })
    @ApiConflictResponse({ description: 'El correo ya esta registrado (como cliente o profesional)' })
    registerCliente(@Body() createClienteDto: CreateClienteDto) {
        return this.authService.registerCliente(createClienteDto);
    }

    @Post('register/profesional')
    @ApiOperation({ summary: 'Registrarse como profesional', description: 'Elige sus zonas de cobertura y sus especialidades. El costo de visita es opcional.' })
    @ApiConflictResponse({ description: 'El correo ya esta registrado (como cliente o profesional)' })
    registerProfesional(@Body() createProfesionalDto: CreateProfesionalDto) {
        return this.authService.registerProfesional(createProfesionalDto);
    }

    @Post('login/cliente')
    @ApiOperation({ summary: 'Iniciar sesion como cliente', description: 'Devuelve el token para usar en "Authorize".' })
    @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' })
    loginCliente(@Body() loginDto: LoginDto) {
        return this.authService.loginCliente(loginDto);
    }

    @Post('login/profesional')
    @ApiOperation({ summary: 'Iniciar sesion como profesional', description: 'Devuelve el token para usar en "Authorize".' })
    @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' })
    loginProfesional(@Body() loginDto: LoginDto) {
        return this.authService.loginProfesional(loginDto);
    }

    @Post('login/admin')
    @ApiOperation({ summary: 'Iniciar sesion como admin', description: 'El admin maneja los catalogos (provincias, zonas, especialidades, metodos de pago, promociones). Sus datos estan en el .env.' })
    @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' })
    loginAdmin(@Body() loginDto: LoginDto) {
        return this.authService.loginAdmin(loginDto);
    }

    @Get('perfil')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ver mis datos', description: 'Datos de la persona logueada (sin la contraseña).' })
    @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
    perfil(@UsuarioActivo() usuario: UsuarioActivoInterface) {
        return this.authService.perfil(usuario);
    }
}
