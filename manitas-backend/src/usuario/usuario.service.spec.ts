import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from './entities/usuario.entity';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { SolicitarNuevaClaveDto } from './dto/solicitar-nueva-clave.dto';
import { RestablecerClaveDto } from './dto/restablecer-clave-dto';
import { RehabilitarUsuarioDto } from './dto/rehabilitar-usuario.dto';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: jest.Mocked<Repository<Usuario>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get(getRepositoryToken(Usuario));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it('el servicio debe estar definido', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('registrar', () => {
    const registerDto: RegisterUsuarioDto = {
      dni: 12345678,
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@ejemplo.com',
      contraseña: '123456',
      telefono: 3411234567,
      rol: 'cliente',
    };

    it('debe registrar un usuario con fechaBaja y fechaRehabilitacion en null por defecto', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({ ...registerDto, idUsuario: 1 } as Usuario);
      repository.save.mockResolvedValue({
        ...registerDto,
        idUsuario: 1,
        contraseña: 'hashed_password',
        fechaBaja: null,
        fechaRehabilitacion: null,
      } as Usuario);

      const resultado = await service.registrar(registerDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { correo: registerDto.correo },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(resultado).not.toHaveProperty('contraseña');
      expect(resultado.fechaBaja).toBeNull();
      expect(resultado.fechaRehabilitacion).toBeNull();
      expect(resultado.idUsuario).toBe(1);
    });

    it('debe lanzar ConflictException si el correo ya existe', async () => {
      repository.findOne.mockResolvedValue({ idUsuario: 1, correo: registerDto.correo } as Usuario);

      await expect(service.registrar(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginUsuarioDto = {
      correo: 'juan@ejemplo.com',
      contraseña: '123456',
    };

    it('debe permitir login si fechaBaja es null', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const usuarioActivo = {
        idUsuario: 1,
        correo: 'juan@ejemplo.com',
        contraseña: hashedPassword,
        rol: 'cliente',
        dni: 12345678,
        fechaBaja: null,
        fechaRehabilitacion: null,
      };

      repository.findOne.mockResolvedValue(usuarioActivo as Usuario);
      jwtService.sign.mockReturnValue('mocked_jwt_token');

      const resultado = await service.login(loginDto);

      expect(resultado).toEqual({ accessToken: 'mocked_jwt_token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: usuarioActivo.idUsuario,
        correo: usuarioActivo.correo,
        rol: usuarioActivo.rol,
        dni: usuarioActivo.dni,
      });
    });

    it('debe rechazar el login con UnauthorizedException si el usuario tiene fechaBaja asignada', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const usuarioInhabilitado = {
        idUsuario: 1,
        correo: 'juan@ejemplo.com',
        contraseña: hashedPassword,
        fechaBaja: new Date(),
        fechaRehabilitacion: null,
      };

      repository.findOne.mockResolvedValue(usuarioInhabilitado as Usuario);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const hashedPassword = await bcrypt.hash('clave_diferente', 10);
      repository.findOne.mockResolvedValue({
        idUsuario: 1,
        correo: 'juan@ejemplo.com',
        contraseña: hashedPassword,
      } as Usuario);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('solicitarNuevaClave', () => {
    const solicitarDto: SolicitarNuevaClaveDto = {
      correo: 'juan@ejemplo.com',
    };

    it('debe generar el token y enviar el correo si el usuario está activo', async () => {
      const usuarioActivo = { idUsuario: 1, correo: 'juan@ejemplo.com', fechaBaja: null } as Usuario;

      repository.findOne.mockResolvedValue(usuarioActivo);
      jwtService.sign.mockReturnValue('token_reset_mock');

      // Mock del método privado de envío de correo
      (service as any).transporter = {
        sendMail: jest.fn().mockResolvedValue(true),
      };

      const resultado = await service.solicitarNuevaClave(solicitarDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { correo: solicitarDto.correo } });
      expect(resultado.message).toContain('éxito');
    });

    it('debe lanzar NotFoundException si el correo no pertenece a un usuario activo', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.solicitarNuevaClave(solicitarDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restablecerClave', () => {
    const restablecerDto: RestablecerClaveDto = {
      token: 'token_valido',
      nuevaClave: 'nuevaClave123',
    };

    it('debe actualizar la contraseña del usuario correctamente', async () => {
      const usuarioMock = { idUsuario: 1, contraseña: 'old_password', fechaBaja: null } as Usuario;

      jwtService.verifyAsync.mockResolvedValue({ sub: 1, tipo: 'reset' });
      repository.findOne.mockResolvedValue(usuarioMock);
      repository.save.mockResolvedValue(usuarioMock);

      const resultado = await service.restablecerClave(restablecerDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(restablecerDto.token);
      expect(repository.save).toHaveBeenCalled();
      expect(resultado.message).toContain('correctamente');
    });

    it('debe lanzar BadRequestException si el token es inválido o expiró', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Token expirado'));

      await expect(service.restablecerClave(restablecerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('darBajaPropia', () => {
    it('debe asignar la fecha actual a fechaBaja cuando el usuario solicita su baja', async () => {
      const usuario = { idUsuario: 1, fechaBaja: null } as Usuario;
      repository.findOne.mockResolvedValue(usuario);
      repository.save.mockImplementation(async (u) => u as Usuario);

      const respuesta = await service.darBajaPropia(1);

      expect(usuario.fechaBaja).toBeInstanceOf(Date);
      expect(respuesta.message).toContain('exitosamente');
    });

    it('debe lanzar BadRequestException si el usuario ya estaba dado de baja', async () => {
      const usuarioDadoDeBaja = { idUsuario: 1, fechaBaja: new Date() } as Usuario;
      repository.findOne.mockResolvedValue(usuarioDadoDeBaja);

      await expect(service.darBajaPropia(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('darBajaPorAdmin', () => {
    it('debe inhabilitar a cualquier usuario asignando fechaBaja', async () => {
      const usuario = { idUsuario: 2, fechaBaja: null } as Usuario;
      repository.findOne.mockResolvedValue(usuario);
      repository.save.mockImplementation(async (u) => u as Usuario);

      const respuesta = await service.darBajaPorAdmin(2);

      expect(usuario.fechaBaja).toBeInstanceOf(Date);
      expect(respuesta.message).toContain('inhabilitado');
    });

    it('debe lanzar NotFoundException si el usuario a inhabilitar no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.darBajaPorAdmin(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rehabilitarUsuario', () => {
    const rehabilitarDto: RehabilitarUsuarioDto = {
      idUsuario: 1,
    };

    it('debe asignar fechaRehabilitacion y limpiar fechaBaja a null', async () => {
      const usuarioDadoDeBaja = { idUsuario: 1, fechaBaja: new Date(), fechaRehabilitacion: null } as Usuario;
      repository.findOne.mockResolvedValue(usuarioDadoDeBaja);
      repository.save.mockImplementation(async (u) => u as Usuario);

      const respuesta = await service.rehabilitarUsuario(rehabilitarDto);

      expect(usuarioDadoDeBaja.fechaBaja).toBeNull();
      expect(usuarioDadoDeBaja.fechaRehabilitacion).toBeInstanceOf(Date);
      expect(respuesta.message).toContain('rehabilitado exitosamente');
    });

    it('debe lanzar BadRequestException si el usuario ya está activo', async () => {
      const usuarioActivo = { idUsuario: 1, fechaBaja: null, fechaRehabilitacion: null } as Usuario;
      repository.findOne.mockResolvedValue(usuarioActivo);

      await expect(service.rehabilitarUsuario(rehabilitarDto)).rejects.toThrow(BadRequestException);
    });
  });
});