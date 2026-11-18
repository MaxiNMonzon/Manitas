import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TurnoService } from './turno.service';
import { Turno } from './entities/turno.entity';
import { HorarioLaboral } from './entities/horario-laboral.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

describe('TurnoService.guardarHorario (horario de trabajo del profesional)', () => {
  let service: TurnoService;
  // Repositorios simulados: no hay base de datos en el test
  const manager = { delete: jest.fn(), insert: jest.fn() };
  const horarioRepository = {
    find: jest.fn().mockResolvedValue([]),
    manager: { transaction: jest.fn((trabajo: (m: typeof manager) => Promise<void>) => trabajo(manager)) },
  };
  const profesionalRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        TurnoService,
        { provide: getRepositoryToken(Turno), useValue: {} },
        { provide: getRepositoryToken(HorarioLaboral), useValue: horarioRepository },
        { provide: getRepositoryToken(Profesional), useValue: profesionalRepository },
        { provide: getRepositoryToken(SolicitudDeServicio), useValue: {} },
      ],
    }).compile();
    service = modulo.get(TurnoService);
    profesionalRepository.findOneBy.mockResolvedValue({ idUsuario: 7 });
  });

  it('guarda el horario reemplazando el anterior', async () => {
    const horarios = [
      { diaSemana: 1, horaDesde: 9, horaHasta: 13 },
      { diaSemana: 1, horaDesde: 15, horaHasta: 19 }, // dos rangos el mismo día, sin pisarse
      { diaSemana: 2, horaDesde: 9, horaHasta: 18 },
    ];
    await service.guardarHorario(7, { horarios });

    expect(manager.delete).toHaveBeenCalledWith(HorarioLaboral, { profesional: { idUsuario: 7 } });
    expect(manager.insert).toHaveBeenCalledWith(
      HorarioLaboral,
      horarios.map((h) => ({ ...h, profesional: { idUsuario: 7 } })),
    );
  });

  it('una lista vacía deja al profesional sin horario (no inserta nada)', async () => {
    await service.guardarHorario(7, { horarios: [] });
    expect(manager.delete).toHaveBeenCalled();
    expect(manager.insert).not.toHaveBeenCalled();
  });

  it('rechaza un rango donde la hora de inicio no es anterior a la de fin', async () => {
    await expect(service.guardarHorario(7, { horarios: [{ diaSemana: 3, horaDesde: 18, horaHasta: 9 }] })).rejects.toThrow(
      BadRequestException,
    );
    expect(manager.insert).not.toHaveBeenCalled();
  });

  it('rechaza dos rangos del mismo día que se pisan', async () => {
    const horarios = [
      { diaSemana: 5, horaDesde: 9, horaHasta: 13 },
      { diaSemana: 5, horaDesde: 12, horaHasta: 18 },
    ];
    await expect(service.guardarHorario(7, { horarios })).rejects.toThrow('se pisan');
  });

  it('falla si el profesional no existe', async () => {
    profesionalRepository.findOneBy.mockResolvedValue(null);
    await expect(service.guardarHorario(99, { horarios: [] })).rejects.toThrow(NotFoundException);
  });
});
