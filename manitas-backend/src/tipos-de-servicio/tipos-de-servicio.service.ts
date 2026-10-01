import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TiposDeServicio } from './entities/tipos-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';

@Injectable()
export class TiposDeServicioService {
constructor(
  @InjectRepository(TiposDeServicio)
  private readonly tiposDeServicioRepository: Repository<TiposDeServicio>,

  @InjectRepository(Especialidad)
  private readonly especialidadRepository: Repository<Especialidad>,
) {}

  async create(createTiposDeServicioDto: CreateTiposDeServicioDto) {
  const especialidad = await this.especialidadRepository.findOneBy({
    idEspecialidad: createTiposDeServicioDto.idEspecialidad,
  });

  if (!especialidad) {
    throw new BadRequestException('La especialidad indicada no existe');
  }

  return await this.tiposDeServicioRepository.save({
    ...createTiposDeServicioDto,
    especialidad,
  });
}

  async findAll() {
    return await this.tiposDeServicioRepository.find();
  }

  async findOne(id: number) {
    const tiposDeServicio = await this.tiposDeServicioRepository.findOneBy({ idServicio: id });
    if (!tiposDeServicio) {
      throw new NotFoundException(`TiposDeServicio con ID ${id} no encontrado`);
    }
    return tiposDeServicio;
  }

  async update(id: number, updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    const tiposDeServicio = await this.findOne(id);
    this.tiposDeServicioRepository.merge(tiposDeServicio, updateTiposDeServicioDto);
    return await this.tiposDeServicioRepository.save(tiposDeServicio);
  }

  async remove(id: number) {
    return await this.tiposDeServicioRepository.softDelete({ idServicio: id });
  }
}
