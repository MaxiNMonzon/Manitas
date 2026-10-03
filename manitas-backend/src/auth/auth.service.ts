import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ClienteService } from '../cliente/cliente.service';
import { ProfesionalService } from '../profesional/profesional.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Injectable()
export class AuthService {

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
        const cliente = await this.clienteService.findOneByEmail(loginDto.correo);
        if (!cliente) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        const contraseñaValida = await bcrypt.compare(loginDto.contraseña, cliente.contraseña);
        if (!contraseñaValida) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        const payload = { sub: cliente.idUsuario, correo: cliente.correo, rol: Rol.CLIENTE };
        const token = await this.jwtService.signAsync(payload);

        return { token, correo: cliente.correo };
    }

    async loginProfesional(loginDto: LoginDto) {
        const profesional = await this.profesionalService.findOneByEmail(loginDto.correo);
        if (!profesional) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        const contraseñaValida = await bcrypt.compare(loginDto.contraseña, profesional.contraseña);
        if (!contraseñaValida) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        const payload = { sub: profesional.idUsuario, correo: profesional.correo, rol: Rol.PROFESIONAL };
        const token = await this.jwtService.signAsync(payload);

        return { token, correo: profesional.correo };
    }

    async loginAdmin(loginDto: LoginDto) {
        const correoAdmin = this.configService.get('ADMIN_CORREO');
        const contraseñaAdmin = this.configService.get('ADMIN_CONTRASENA');

        if (!correoAdmin || !contraseñaAdmin || loginDto.correo !== correoAdmin || loginDto.contraseña !== contraseñaAdmin) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        const payload = { sub: 0, correo: correoAdmin, rol: Rol.ADMIN };
        const token = await this.jwtService.signAsync(payload);

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

}