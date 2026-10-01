import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity';

@Injectable()
export class ProvinciaService {
constructor(
  @InjectRepository(Provincia)
  private readonly provinciaRepository: Repository<Provincia>,
) {}

  async create(createProvinciaDto: CreateProvinciaDto) {
    return await this.provinciaRepository.save(createProvinciaDto);
  }

  async findAll() {
    return await this.provinciaRepository.find();
  }

  async findOne(id: number) {
    const provincia = await this.provinciaRepository.findOneBy({idProvincia: id});
    if (!provincia) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada`);
    }
    return provincia;
  }

  async update(id: number, updateProvinciaDto: UpdateProvinciaDto) {
    const provincia = await this.findOne(id);
    this.provinciaRepository.merge(provincia, updateProvinciaDto);
    return await this.provinciaRepository.save(provincia);
  }

  async remove(id: number) {
    return await this.provinciaRepository.softDelete({idProvincia: id});
  }
}