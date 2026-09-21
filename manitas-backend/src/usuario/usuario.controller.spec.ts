import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { SolicitarNuevaClaveDto } from './dto/solicitar-nueva-clave.dto';
import { RestablecerClaveDto } from './dto/restablecer-clave-dto';
import { RehabilitarUsuarioDto } from './dto/rehabilitar-usuario.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';


describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: jest.Mocked<UsuarioService>;

  // Mock de todos los métodos expuestos por el servicio
  const mockUsuarioService = {
    registrar: jest.fn(),
    login: jest.fn(),
    solicitarNuevaClave: jest.fn(),
    restablecerClave: jest.fn(),
    darBajaPropia: jest.fn(),
    darBajaPorAdmin: jest.fn(),
    rehabilitarUsuario: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Bypass de autenticación JWT para tests unitarios
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Bypass de Guard de Roles para tests unitarios
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get(UsuarioService);

    jest.clearAllMocks();
  });

  it('el controlador debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('registrar', () => {
    it('debe llamar a usuarioService.registrar con el DTO correcto', async () => {
      const dto: RegisterUsuarioDto = {
        dni: 12345678,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@ejemplo.com',
        contraseña: '123456',
        telefono: 3411234567,
        rol: 'cliente',
      };

      const respuestaEsperada = {
        idUsuario: 1,
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        telefono: dto.telefono,
        rol: dto.rol,
        fechaBaja: null as any,
        fechaRehabilitacion: null as any,
      };

      mockUsuarioService.registrar.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.registrar(dto);

      expect(service.registrar).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('login', () => {
    it('debe llamar a usuarioService.login y retornar el token', async () => {
      const dto: LoginUsuarioDto = {
        correo: 'juan@ejemplo.com',
        contraseña: '123456',
      };

      const respuestaEsperada = { accessToken: 'token_mock_123' };
      mockUsuarioService.login.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('solicitarNuevaClave', () => {
    it('debe solicitar la nueva clave al servicio con el DTO ingresado', async () => {
      const dto: SolicitarNuevaClaveDto = { correo: 'juan@ejemplo.com' };
      const respuestaEsperada = { message: 'Correo de recuperación enviado con éxito.' };

      mockUsuarioService.solicitarNuevaClave.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.solicitarNuevaClave(dto);

      expect(service.solicitarNuevaClave).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('restablecerClave', () => {
    it('debe llamar a restablecerClave en el servicio', async () => {
      const dto: RestablecerClaveDto = {
        token: 'token_reset_valido',
        nuevaClave: 'nuevaClave123',
      };
      const respuestaEsperada = { message: 'Contraseña actualizada correctamente.' };

      mockUsuarioService.restablecerClave.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.restablecerClave(dto);

      expect(service.restablecerClave).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('obtenerPerfil', () => {
    it('debe retornar los datos del usuario adjuntos a la request', () => {
      const mockRequest = {
        user: {
          sub: 1,
          correo: 'juan@ejemplo.com',
          rol: 'cliente',
          dni: 12345678,
        },
      };

      const resultado = controller.obtenerPerfil(mockRequest);

      expect(resultado).toEqual(mockRequest.user);
    });
  });

  describe('solicitarBajaPropia', () => {
    it('debe invocar darBajaPropia con el ID extraído de la request', async () => {
      const mockReq = { user: { sub: 1 } };
      const respuestaEsperada = { message: 'Cuenta dada de baja exitosamente' };
      mockUsuarioService.darBajaPropia.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.solicitarBajaPropia(mockReq);

      expect(service.darBajaPropia).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('inhabilitarUsuario', () => {
    it('debe invocar darBajaPorAdmin con el ID pasado por parámetro', async () => {
      const idUsuario = 5;
      const respuestaEsperada = { message: `El usuario con ID ${idUsuario} ha sido inhabilitado` };
      mockUsuarioService.darBajaPorAdmin.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.inhabilitarUsuario(idUsuario);

      expect(service.darBajaPorAdmin).toHaveBeenCalledWith(idUsuario);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });

  describe('rehabilitarUsuario', () => {
    it('debe invocar rehabilitarUsuario en el servicio enviando el DTO', async () => {
      const dto: RehabilitarUsuarioDto = { id: 5 };
      const respuestaEsperada = { message: 'El usuario con ID 5 ha sido rehabilitado exitosamente' };
      mockUsuarioService.rehabilitarUsuario.mockResolvedValue(respuestaEsperada);

      const resultado = await controller.rehabilitarUsuario(dto);

      expect(service.rehabilitarUsuario).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(respuestaEsperada);
    });
  });
});