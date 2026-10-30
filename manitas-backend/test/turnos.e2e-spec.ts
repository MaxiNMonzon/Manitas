// TEST DE INTEGRACIÓN: levanta la aplicación HTTP de Nest con las piezas reales que intervienen en
// un pedido (controlador, ValidationPipe, DTOs, AuthGuard, RolesGuard y JwtService) y le hace pedidos
// HTTP con supertest. Solo se reemplaza el servicio (no hay base de datos en el test).
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { TurnoController } from '../src/turno/turno.controller';
import { TurnoService } from '../src/turno/turno.service';
import { Rol } from '../src/common/enums/rol.enum';

describe('Turnos: API protegida por login y roles (integración)', () => {
  let app: INestApplication<App>;
  let tokenProfesional: string;
  let tokenCliente: string;
  const turnoService = {
    guardarHorario: jest.fn().mockResolvedValue([{ diaSemana: 1, horaDesde: 9, horaHasta: 18 }]),
    libres: jest.fn().mockResolvedValue([]),
    verHorario: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: 'secreto-de-prueba', signOptions: { expiresIn: '1h' } })],
      controllers: [TurnoController],
      providers: [{ provide: TurnoService, useValue: turnoService }],
    }).compile();

    app = modulo.createNestApplication();
    // La misma validación que en main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const jwt = modulo.get(JwtService);
    tokenProfesional = await jwt.signAsync({ sub: 7, correo: 'jorge@test.com', rol: Rol.PROFESIONAL });
    tokenCliente = await jwt.signAsync({ sub: 12, correo: 'laura@test.com', rol: Rol.CLIENTE });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  const horario = { horarios: [{ diaSemana: 1, horaDesde: 9, horaHasta: 18 }] };

  it('sin token responde 401', async () => {
    await request(app.getHttpServer()).put('/turnos/mi-horario').send(horario).expect(401);
    expect(turnoService.guardarHorario).not.toHaveBeenCalled();
  });

  it('con un token de cliente responde 403 (es una ruta de profesional)', async () => {
    await request(app.getHttpServer())
      .put('/turnos/mi-horario')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send(horario)
      .expect(403);
    expect(turnoService.guardarHorario).not.toHaveBeenCalled();
  });

  it('con datos inválidos responde 400 con los mensajes de validación', async () => {
    const respuesta = await request(app.getHttpServer())
      .put('/turnos/mi-horario')
      .set('Authorization', `Bearer ${tokenProfesional}`)
      .send({ horarios: [{ diaSemana: 9, horaDesde: 9, horaHasta: 18 }] })
      .expect(400);
    expect(JSON.stringify(respuesta.body.message)).toContain('diaSemana');
  });

  it('rechaza campos que no están en el DTO (asignación masiva)', async () => {
    await request(app.getHttpServer())
      .put('/turnos/mi-horario')
      .set('Authorization', `Bearer ${tokenProfesional}`)
      .send({ ...horario, idProfesional: 99 })
      .expect(400);
  });

  it('el profesional guarda su horario y el id sale del token, no del pedido', async () => {
    await request(app.getHttpServer())
      .put('/turnos/mi-horario')
      .set('Authorization', `Bearer ${tokenProfesional}`)
      .send(horario)
      .expect(200);
    expect(turnoService.guardarHorario).toHaveBeenCalledWith(7, horario);
  });

  it('los turnos libres son públicos pero validan las fechas', async () => {
    await request(app.getHttpServer()).get('/turnos/libres/7?desde=ayer&hasta=2026-11-10').expect(400);
    await request(app.getHttpServer()).get('/turnos/libres/7?desde=2026-11-03&hasta=2026-11-10').expect(200);
    expect(turnoService.libres).toHaveBeenCalledWith(7, { desde: '2026-11-03', hasta: '2026-11-10' });
  });
});