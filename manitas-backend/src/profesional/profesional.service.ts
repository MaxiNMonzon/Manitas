import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesional } from './entities/profesional.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
  ) {}

  async create(
    createProfesionalDto: CreateProfesionalDto,
  ): Promise<Profesional> {
    const nuevoProfesional =
      this.profesionalRepository.create(createProfesionalDto);
    return await this.profesionalRepository.save(nuevoProfesional);
  }

  async findAll(): Promise<Profesional[]> {
    return await this.profesionalRepository.find();
  }

  async findOne(id: number): Promise<Profesional> {
    const profesional = await this.profesionalRepository.findOneBy({ id });
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
    this.profesionalRepository.merge(profesional, updateProfesionalDto);
    return await this.profesionalRepository.save(profesional);
  }

  async remove(id: number): Promise<{ message: string }> {
    const profesional = await this.findOne(id);
    await this.profesionalRepository.remove(profesional);
    return { message: `Profesional con ID ${id} eliminado` };
  }
}
