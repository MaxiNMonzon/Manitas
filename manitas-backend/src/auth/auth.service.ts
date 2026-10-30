import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ClienteService } from '../cliente/cliente.service';
import { ProfesionalService } from '../profesional/profesional.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';
import { LoginDto } from './dto/login.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';
import { IntentosLogin } from './intentos-login';

@Injectable()
export class AuthService {
    // 3 intentos fallidos seguidos bloquean la cuenta 15 minutos
    private readonly intentos: IntentosLogin = new IntentosLogin();

    constructor(
        private readonly clienteService: ClienteService,
        private readonly profesionalService: ProfesionalService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async registerCliente(createClienteDto: CreateClienteDto) {
        return await this.clienteService.create(createClienteDto);
    }

    async registerProfesional(createProfesionalDto: CreateProfesionalDto) {
        return await this.profesionalService.create(createProfesionalDto);
    }

    async loginCliente(loginDto: LoginDto) {
        this.intentos.verificar(Rol.CLIENTE, loginDto.correo);
        const cliente = await this.clienteService.findOneByEmail(loginDto.correo);
        if (!cliente || !(await bcrypt.compare(loginDto.contraseña, cliente.contraseña))) {
            this.intentos.fallo(Rol.CLIENTE, loginDto.correo);
        }
        this.intentos.exito(Rol.CLIENTE, loginDto.correo);

        const payload = { sub: cliente.idUsuario, correo: cliente.correo, rol: Rol.CLIENTE };
        const token = await this.jwtService.signAsync(payload);

        return { token, correo: cliente.correo };
    }

    async loginProfesional(loginDto: LoginDto) {
        this.intentos.verificar(Rol.PROFESIONAL, loginDto.correo);
        const profesional = await this.profesionalService.findOneByEmail(loginDto.correo);
        if (!profesional || !(await bcrypt.compare(loginDto.contraseña, profesional.contraseña))) {
            this.intentos.fallo(Rol.PROFESIONAL, loginDto.correo);
        }
        this.intentos.exito(Rol.PROFESIONAL, loginDto.correo);

        const payload = { sub: profesional.idUsuario, correo: profesional.correo, rol: Rol.PROFESIONAL };
        const token = await this.jwtService.signAsync(payload);

        return { token, correo: profesional.correo };
    }

    async loginAdmin(loginDto: LoginDto) {
        const correoAdmin = this.configService.get('ADMIN_CORREO');
        const contraseñaAdmin = this.configService.get('ADMIN_CONTRASENA');
        this.intentos.verificar(Rol.ADMIN, loginDto.correo);

        if (!correoAdmin || !contraseñaAdmin || loginDto.correo !== correoAdmin || loginDto.contraseña !== contraseñaAdmin) {
            this.intentos.fallo(Rol.ADMIN, loginDto.correo);
        }
        this.intentos.exito(Rol.ADMIN, loginDto.correo);

        const payload = { sub: 0, correo: correoAdmin, rol: Rol.ADMIN };
        // El del admin dura menos (2 h, los demás 1 día): puede cambiar todos los catálogos
        const token = await this.jwtService.signAsync(payload, { expiresIn: '2h' });

        return { token, correo: correoAdmin };
    }

    async perfil({ sub, correo, rol }: UsuarioActivoInterface) {
        if (rol === Rol.ADMIN) {
            return { correo, rol };
        }
        if (rol === Rol.CLIENTE) {
            return await this.clienteService.findOne(sub);
        }
        return await this.profesionalService.findOne(sub);
    }

    // Cambiar la contraseña pidiendo la actual (cliente o profesional; la del admin esta en el .env)
    async cambiarContraseña({ sub, rol }: UsuarioActivoInterface, dto: CambiarContrasenaDto) {
        if (rol === Rol.ADMIN) {
            throw new ForbiddenException('La contraseña del admin se cambia en el .env');
        }
        const persona = rol === Rol.CLIENTE ? await this.clienteService.findOne(sub) : await this.profesionalService.findOne(sub);
        const actualValida = await bcrypt.compare(dto.contraseñaActual, persona.contraseña);
        if (!actualValida) {
            throw new BadRequestException('La contraseña actual no es correcta');
        }
        if (dto.contraseñaActual === dto.contraseñaNueva) {
            throw new BadRequestException('La contraseña nueva tiene que ser distinta de la actual');
        }
        // El update de cada uno ya la guarda hasheada
        if (rol === Rol.CLIENTE) {
            await this.clienteService.update(sub, { contraseña: dto.contraseñaNueva }, sub);
        } else {
            await this.profesionalService.update(sub, { contraseña: dto.contraseñaNueva }, sub);
        }
        return { mensaje: 'Contraseña actualizada' };
    }

}
