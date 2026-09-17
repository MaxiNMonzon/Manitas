import { Injectable } from '@nestjs/common';
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
    return await this.provinciaRepository.findOneBy({idProvincia: id});
  }

  async update(id: number, updateProvinciaDto: UpdateProvinciaDto) {
    return await this.provinciaRepository.update(id, updateProvinciaDto);
  }

  async remove(id: number) {
    return await this.provinciaRepository.softDelete({idProvincia: id});
  }
}