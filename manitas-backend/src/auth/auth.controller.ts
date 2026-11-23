import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';
import { LoginDto } from './dto/login.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { OlvideContrasenaDto } from './dto/olvide-contrasena.dto';
import { RestablecerContrasenaDto } from './dto/restablecer-contrasena.dto';
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

    @Post('login')
    @ApiOperation({
        summary: 'Iniciar sesion',
        description: 'Uno solo para todos: con el correo, el back averigua si es el admin, un cliente o un profesional ' +
            '(el correo es unico entre cliente y profesional). Devuelve el token (para usar en "Authorize") y el rol. ' +
            'El token del admin dura 2 horas; el de los demas, 1 dia.',
    })
    @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos (dice cuantos intentos quedan)' })
    @ApiTooManyRequestsResponse({ description: '3 intentos fallidos seguidos: la cuenta queda bloqueada 15 minutos' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('perfil')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ver mis datos', description: 'Datos de la persona logueada (sin la contraseña).' })
    @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
    perfil(@UsuarioActivo() usuario: UsuarioActivoInterface) {
        return this.authService.perfil(usuario);
    }

    @Patch('contrasena')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar mi contraseña', description: 'Cliente o profesional. Pide la contraseña actual; la nueva, minimo 8 caracteres y distinta de la actual.' })
    @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
    @ApiBadRequestResponse({ description: 'La contraseña actual no es correcta, o la nueva es igual o muy corta' })
    cambiarContraseña(@UsuarioActivo() usuario: UsuarioActivoInterface, @Body() dto: CambiarContrasenaDto) {
        return this.authService.cambiarContraseña(usuario, dto);
    }

    @Post('olvide-contrasena')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Olvidé mi contraseña',
        description: 'Cliente o profesional (el back averigua cual con el correo). Si la cuenta existe, le manda un mail con un link para crear una contraseña nueva (sirve una vez y vence en 30 minutos). ' +
            'Responde siempre lo mismo, exista o no la cuenta. Como mucho un mail por minuto a cada cuenta.',
    })
    @ApiServiceUnavailableResponse({ description: 'No se pudo mandar el mail' })
    olvideContraseña(@Body() dto: OlvideContrasenaDto) {
        return this.authService.olvideContraseña(dto);
    }

    @Post('restablecer-contrasena')
    @HttpCode(200)
    @ApiOperation({ summary: 'Crear una contraseña nueva con el link del mail', description: 'Recibe el codigo del link y la contraseña nueva (minimo 8). Desbloquea la cuenta si estaba bloqueada por intentos fallidos.' })
    @ApiBadRequestResponse({ description: 'El link vencio, ya se uso o no existe; o la contraseña es muy corta' })
    restablecerContraseña(@Body() dto: RestablecerContrasenaDto) {
        return this.authService.restablecerContraseña(dto);
    }
}
