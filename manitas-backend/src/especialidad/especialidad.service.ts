import { Injectable } from '@nestjs/common';
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
    return await this.especialidadRepository.findOneBy({idEspecialidad: id});
  }

  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
    return await this.especialidadRepository.update(id, updateEspecialidadDto);
  }

  async remove(id: number) {
    return await this.especialidadRepository.softDelete({idEspecialidad: id});
  }
}