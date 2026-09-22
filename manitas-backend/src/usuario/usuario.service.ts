import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { SolicitarNuevaClaveDto } from './dto/solicitar-nueva-clave.dto';
import { RestablecerClaveDto } from './dto/restablecer-clave-dto';
import { RehabilitarUsuarioDto } from './dto/rehabilitar-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';


//Las acciones se realizan sobre la entidad usuario en la base de datos.
@Injectable()
export class UsuarioService {
  private transporter: nodemailer.Transporter;
 
constructor(
  @InjectRepository(Usuario)
  private readonly usuarioRepository: Repository<Usuario>,
  private readonly jwtService: JwtService,
) {
  // Configuración dinámica según el proveedor definido en las variables de entorno
    this.transporter = this.crearTransporter();
}

private crearTransporter(): nodemailer.Transporter {
    const emailService = process.env.EMAIL_SERVICE; // Ej: 'gmail', 'hotmail', 'yahoo'

    // Opción 1: Si se define un servicio conocido (Gmail, Hotmail/Outlook, Yahoo)
    if (emailService) {
      return nodemailer.createTransport({
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Contraseña de aplicación generada en el proveedor
        },
      });
    }

    // Opción 2: Servidor SMTP genérico o personalizado (Fallback)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.EMAIL_PORT) || 2525,
      secure: process.env.EMAIL_SECURE === 'true', // true para puerto 465, false para otros
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
async registrar(dto: RegisterUsuarioDto): Promise<Omit<Usuario, 'contraseña'>> {
    const existe = await this.usuarioRepository.findOne({ where: { correo: dto.correo } });
    if (existe) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.contraseña, 10);
    
    const nuevoUsuario = this.usuarioRepository.create({
      ...dto,
      contraseña: hashedPassword,
      fechaBaja: null,
      fechaRehabilitacion: null,
    });

    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
    const { contraseña, ...usuarioSinClave } = usuarioGuardado;
    return usuarioSinClave;
  }

  async login(dto: LoginUsuarioDto): Promise<{ accessToken: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { correo: dto.correo } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.fechaBaja !== null) {
      throw new UnauthorizedException('La cuenta se encuentra inhabilitada');
    }

    const passwordValida = await bcrypt.compare(dto.contraseña, usuario.contraseña);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      dni: usuario.dni,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async darBajaPropia(idUsuario: number): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.fechaBaja !== null) {
      throw new BadRequestException('La cuenta ya se encuentra dada de baja');
    }

    usuario.fechaBaja = new Date();
    await this.usuarioRepository.save(usuario);

    return { message: 'Cuenta dada de baja exitosamente' };
  }

  async darBajaPorAdmin(idUsuario: number): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.fechaBaja = new Date();
    await this.usuarioRepository.save(usuario);

    return { message: `El usuario con ID ${idUsuario} ha sido inhabilitado` };
  }

  // Método para que el Administrador reactive una cuenta inhabilitada
  async rehabilitarUsuario(dto: RehabilitarUsuarioDto): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { idUsuario: dto.idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.fechaBaja === null) {
      throw new BadRequestException('El usuario ya se encuentra activo');
    }

    usuario.fechaBaja = null;
    usuario.fechaRehabilitacion = new Date();
    await this.usuarioRepository.save(usuario);

    return { message: `El usuario con ID ${dto.idUsuario} ha sido rehabilitado exitosamente` };
  }

  async solicitarNuevaClave(dto: SolicitarNuevaClaveDto): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { correo: dto.correo } });
    if (!usuario || usuario.fechaBaja !== null) {
      throw new NotFoundException('El correo ingresado no pertenece a una cuenta activa');
    }

    const resetToken = this.jwtService.sign(
      { sub: usuario.idUsuario, tipo: 'reset' },
      { expiresIn: '15m' },
    );

    const enlaceRecuperacion = `http://localhost:3000/restablecer-clave?token=${resetToken}`;

    await this.transporter.sendMail({
      from: `"Soporte Sistema" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: 'Restablecimiento de Contraseña',
      html: `
        <h2>Restablecer contraseña</h2>
        <p>Hacé clic en el siguiente enlace para restablecer tu clave:</p>
        <a href="${enlaceRecuperacion}">${enlaceRecuperacion}</a>
        <p>Este enlace expirará en 15 minutos.</p>
      `,
    });

    return { message: 'Correo de recuperación enviado con éxito.' };
  }

  async restablecerClave(dto: RestablecerClaveDto): Promise<{ message: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);

      if (payload.tipo !== 'reset') {
        throw new BadRequestException('Token inválido');
      }

      const usuario = await this.usuarioRepository.findOne({ where: { idUsuario: payload.sub } });
      if (!usuario || usuario.fechaBaja !== null) {
        throw new NotFoundException('Usuario no encontrado o inhabilitado');
      }

      const hashedPassword = await bcrypt.hash(dto.nuevaClave, 10);
      usuario.contraseña = hashedPassword;
      await this.usuarioRepository.save(usuario);

      return { message: 'Contraseña actualizada correctamente.' };
    } catch (error) {
      throw new BadRequestException('El token es inválido o ha expirado.');
    }
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    return await this.usuarioRepository.save(createUsuarioDto);
  }

  async findAll() {
    return await this.usuarioRepository.find();
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOneBy({idUsuario: id});
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    this.usuarioRepository.merge(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: number) {
    return await this.usuarioRepository.softDelete({idUsuario: id});
  }
}
