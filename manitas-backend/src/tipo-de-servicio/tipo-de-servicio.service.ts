import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTipoDeServicioDto } from './dto/create-tipo-de-servicio.dto';
import { UpdateTipoDeServicioDto } from './dto/update-tipo-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDeServicio } from './entities/tipo-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';

@Injectable()
export class TipoDeServicioService {
constructor(
  @InjectRepository(TipoDeServicio)
  private readonly tipoDeServicioRepository: Repository<TipoDeServicio>,

  @InjectRepository(Especialidad)
  private readonly especialidadRepository: Repository<Especialidad>,
) {}

  async create(createTipoDeServicioDto: CreateTipoDeServicioDto) {
  const especialidad = await this.especialidadRepository.findOneBy({
    idEspecialidad: createTipoDeServicioDto.idEspecialidad,
  });

  if (!especialidad) {
    throw new BadRequestException('La especialidad indicada no existe');
  }

  return await this.tipoDeServicioRepository.save({
    ...createTipoDeServicioDto,
    especialidad,
  });
}

  // Listado "Tipo de Servicio por Especialidad": si viene la especialidad, solo los de esa
  async findAll(idEspecialidad?: number) {
    return await this.tipoDeServicioRepository.find({
      where: idEspecialidad ? { especialidad: { idEspecialidad } } : {},
      relations: { especialidad: true },
    });
  }

  // Detalle: el tipo de servicio con su especialidad y los profesionales que la hacen
  async findOne(id: number) {
    const tipoDeServicio = await this.tipoDeServicioRepository.findOne({
      where: { idServicio: id },
      relations: { especialidad: { profesionales: true } },
    });
    if (!tipoDeServicio) {
      throw new NotFoundException(`TipoDeServicio con ID ${id} no encontrado`);
    }
    return tipoDeServicio;
  }

  async update(id: number, updateTipoDeServicioDto: UpdateTipoDeServicioDto) {
    const tipoDeServicio = await this.findOne(id);
    this.tipoDeServicioRepository.merge(tipoDeServicio, updateTipoDeServicioDto);
    return await this.tipoDeServicioRepository.save(tipoDeServicio);
  }

  async remove(id: number) {
    return await this.tipoDeServicioRepository.softDelete({ idServicio: id });
  }
}