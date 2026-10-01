import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './entities/especialidad.entity';

@Injectable()
export class EspecialidadService {
constructor(
  @InjectRepository(Especialidad)
  private readonly especialidadRepository: Repository<Especialidad>,
) {}

  async create(createEspecialidadDto: CreateEspecialidadDto) {
    return await this.especialidadRepository.save(createEspecialidadDto);
  }

  async findAll() {
    return await this.especialidadRepository.find();
  }

  async findOne(id: number) {
    const especialidad = await this.especialidadRepository.findOneBy({idEspecialidad: id});
    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }
    return especialidad;
  }

  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
    const especialidad = await this.findOne(id);
    this.especialidadRepository.merge(especialidad, updateEspecialidadDto);
    return await this.especialidadRepository.save(especialidad);
  }

  async remove(id: number) {
    return await this.especialidadRepository.softDelete({idEspecialidad: id});
  }
}
