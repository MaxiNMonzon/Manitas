import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
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
import { RecuperacionContrasena } from './entities/recuperacion-contrasena.entity';
import { OlvideContrasenaDto } from './dto/olvide-contrasena.dto';
import { RestablecerContrasenaDto } from './dto/restablecer-contrasena.dto';
import { CorreoService } from './correo.service';

const MINUTOS_LINK = 30;

// El codigo del link se guarda hasheado (sha256): si alguien lee la base, no puede usarlo
const hashDe = (codigo: string) => createHash('sha256').update(codigo).digest('hex');

@Injectable()
export class AuthService {
    // 3 intentos fallidos seguidos bloquean la cuenta 15 minutos
    private readonly intentos: IntentosLogin = new IntentosLogin();

    constructor(
        private readonly clienteService: ClienteService,
        private readonly profesionalService: ProfesionalService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly correoService: CorreoService,
        @InjectRepository(RecuperacionContrasena)
        private readonly recuperacionRepository: Repository<RecuperacionContrasena>,
    ){}

    async registerCliente(createClienteDto: CreateClienteDto) {
        return await this.clienteService.create(createClienteDto);
    }

    async registerProfesional(createProfesionalDto: CreateProfesionalDto) {
        return await this.profesionalService.create(createProfesionalDto);
    }

    // Un solo login para todos: el que entra pone su correo y su contraseña, y el back averigua
    // si es el admin, un cliente o un profesional (el correo es único entre cliente y profesional).
    // El rol va adentro del token y también se devuelve, para que el front sepa qué pantallas mostrar
    async login({ correo, contraseña }: LoginDto) {
        this.intentos.verificar(correo);

        // El admin no está en la base: su correo y su contraseña están en el .env
        const correoAdmin = this.configService.get('ADMIN_CORREO');
        const contraseñaAdmin = this.configService.get('ADMIN_CONTRASENA');
        if (correoAdmin && correo.trim().toLowerCase() === String(correoAdmin).toLowerCase()) {
            if (!contraseñaAdmin || contraseña !== contraseñaAdmin) {
                this.intentos.fallo(correo);
            }
            this.intentos.exito(correo);
            // El del admin dura menos (2 h, los demás 1 día): puede cambiar todos los catálogos
            const token = await this.jwtService.signAsync({ sub: 0, correo: correoAdmin, rol: Rol.ADMIN }, { expiresIn: '2h' });
            return { token, correo: correoAdmin, rol: Rol.ADMIN };
        }

        const cliente = await this.clienteService.findOneByEmail(correo);
        const profesional = cliente ? null : await this.profesionalService.findOneByEmail(correo);
        const cuenta = cliente ?? profesional;
        // Si el correo no existe o la contraseña está mal, el mensaje es el mismo (no se dice qué falló)
        if (!cuenta || !(await bcrypt.compare(contraseña, cuenta.contraseña))) {
            this.intentos.fallo(correo);
        }
        this.intentos.exito(correo);

        const rol = cliente ? Rol.CLIENTE : Rol.PROFESIONAL;
        const token = await this.jwtService.signAsync({ sub: cuenta.idUsuario, correo: cuenta.correo, rol });
        return { token, correo: cuenta.correo, rol };
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

    // "Olvidé mi contraseña": si la cuenta existe, le manda un mail con un link para crear una nueva.
    // Siempre responde lo mismo, exista o no, para no mostrar que correos estan registrados
    async olvideContraseña({ correo }: OlvideContrasenaDto) {
        const mensaje = 'Si el correo está registrado, te mandamos un mail con un link para crear una contraseña nueva. Revisá también el correo no deseado.';
        // El rol lo averigua el back con el correo (es único entre cliente y profesional)
        const cliente = await this.clienteService.findOneByEmail(correo.trim());
        const persona = cliente ?? (await this.profesionalService.findOneByEmail(correo.trim()));
        if (!persona) {
            return { mensaje };
        }
        const rol = cliente ? Rol.CLIENTE : Rol.PROFESIONAL;

        // Como mucho un mail por minuto a cada cuenta (para que nadie le llene la casilla a otro)
        const ultimo = await this.recuperacionRepository.findOne({ where: { correo: persona.correo, rol }, order: { fecha: 'DESC' } });
        if (ultimo && Date.now() - ultimo.fecha.getTime() < 60 * 1000) {
            return { mensaje };
        }

        // Los links que habia pedido antes dejan de servir: vale solo el ultimo
        await this.recuperacionRepository.update({ correo: persona.correo, rol, usado: false }, { usado: true });

        const codigo = randomBytes(32).toString('hex');
        await this.recuperacionRepository.save(this.recuperacionRepository.create({
            correo: persona.correo,
            rol,
            codigoHash: hashDe(codigo),
            vence: new Date(Date.now() + MINUTOS_LINK * 60 * 1000),
        }));

        const front = this.configService.get<string>('FRONT_URL') ?? 'http://localhost:5173';
        await this.correoService.enviarRecuperacion(persona.correo, persona.nombre, `${front}/restablecer-contrasena?codigo=${codigo}`);
        return { mensaje };
    }

    // Con el codigo del mail se elige la contraseña nueva. El codigo sirve una sola vez y vence a los 30 minutos
    async restablecerContraseña({ codigo, contraseña }: RestablecerContrasenaDto) {
        const pedido = await this.recuperacionRepository.findOneBy({ codigoHash: hashDe(codigo) });
        if (!pedido || pedido.usado || pedido.vence < new Date()) {
            throw new BadRequestException('El link ya no sirve (venció o ya se usó)');
        }
        const persona = pedido.rol === Rol.CLIENTE
            ? await this.clienteService.findOneByEmail(pedido.correo)
            : await this.profesionalService.findOneByEmail(pedido.correo);
        if (!persona) {
            throw new BadRequestException('El link ya no sirve (venció o ya se usó)');
        }

        // El update de cada uno ya la guarda hasheada
        if (pedido.rol === Rol.CLIENTE) {
            await this.clienteService.update(persona.idUsuario, { contraseña }, persona.idUsuario);
        } else {
            await this.profesionalService.update(persona.idUsuario, { contraseña }, persona.idUsuario);
        }
        pedido.usado = true;
        await this.recuperacionRepository.save(pedido);
        // Si estaba bloqueada por intentos fallidos, ya puede entrar
        this.intentos.exito(pedido.correo);

        return { mensaje: 'Listo, ya podés entrar con tu contraseña nueva', rol: pedido.rol };
    }

}
