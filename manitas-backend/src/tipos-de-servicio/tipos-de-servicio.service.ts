import { Injectable } from '@nestjs/common';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TiposDeServicio } from './entities/tipos-de-servicio.entity';

@Injectable()
export class TiposDeServicioService {
constructor(
  @InjectRepository(TiposDeServicio)
  private readonly tiposDeServicioRepository: Repository<TiposDeServicio>,
) {}

  async create(createTiposDeServicioDto: CreateTiposDeServicioDto) {
    return await this.tiposDeServicioRepository.save(createTiposDeServicioDto);
  }

  async findAll() {
    return await this.tiposDeServicioRepository.find();
  }

  async findOne(id: number) {
    return await this.tiposDeServicioRepository.findOneBy({ idServicio: id });
  }

  async update(id: number, updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return await this.tiposDeServicioRepository.update(id, updateTiposDeServicioDto);
  }

  async remove(id: number) {
    return await this.tiposDeServicioRepository.softDelete({ idServicio: id });
  }
}
