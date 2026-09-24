import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Profesional } from './entities/profesional.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,

    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(
    createProfesionalDto: CreateProfesionalDto,
  ): Promise<Profesional> {
    const correoEnUso =
      (await this.profesionalRepository.findOneBy({ correo: createProfesionalDto.correo })) ||
      (await this.clienteRepository.findOneBy({ correo: createProfesionalDto.correo }));

    if (correoEnUso) {
      throw new ConflictException('Ya existe un usuario registrado con ese correo');
    }

    const zonasDeCobertura = await this.zonaRepository.findBy({
      idZona: In(createProfesionalDto.idsZonasCobertura),
    });

    if (zonasDeCobertura.length !== createProfesionalDto.idsZonasCobertura.length) {
      throw new BadRequestException('Alguna de las zonas de cobertura indicadas no existe');
    }

    const nuevoProfesional = this.profesionalRepository.create({
      ...createProfesionalDto,
      zonasDeCobertura,
    });
    return await this.profesionalRepository.save(nuevoProfesional);
  }

  async findAll(): Promise<Profesional[]> {
    return await this.profesionalRepository.find();
  }

  async findOne(id: number): Promise<Profesional> {
    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: id });
    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }
    return profesional;
  }

  async update(
    id: number,
    updateProfesionalDto: UpdateProfesionalDto,
  ): Promise<Profesional> {
    const profesional = await this.findOne(id);

    const { idsZonasCobertura, ...resto } = updateProfesionalDto;

    if (idsZonasCobertura !== undefined) {
      const zonasDeCobertura = await this.zonaRepository.findBy({
        idZona: In(idsZonasCobertura),
      });

      if (zonasDeCobertura.length !== idsZonasCobertura.length) {
        throw new BadRequestException('Alguna de las zonas de cobertura indicadas no existe');
      }
      profesional.zonasDeCobertura = zonasDeCobertura;
    }

    this.profesionalRepository.merge(profesional, resto);
    return await this.profesionalRepository.save(profesional);
  }

  async remove(id: number): Promise<{ message: string }> {
    const profesional = await this.findOne(id);
    await this.profesionalRepository.remove(profesional);
    return { message: `Profesional con ID ${id} eliminado` };
  }
}