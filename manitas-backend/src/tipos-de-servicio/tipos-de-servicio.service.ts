import { Injectable, BadRequestException } from '@nestjs/common';
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
    return await this.tiposDeServicioRepository.findOneBy({ idServicio: id });
  }

  async update(id: number, updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return await this.tiposDeServicioRepository.update(id, updateTiposDeServicioDto);
  }

  async remove(id: number) {
    return await this.tiposDeServicioRepository.softDelete({ idServicio: id });
  }
}
