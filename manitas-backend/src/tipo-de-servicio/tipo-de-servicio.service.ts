import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTipoDeServicioDto } from './dto/create-tipo-de-servicio.dto';
import { UpdateTipoDeServicioDto } from './dto/update-tipo-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDeServicio } from './entities/tipo-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
//Crea tipo de servicio e implementa sus cruds y mapea especialidades.
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

  async findAll() {
    return await this.tipoDeServicioRepository.find();
  }


   async findOne(id: number) {
    const tipoDeServicio = await this.tipoDeServicioRepository.findOneBy({ idServicio: id });
    if (!tipoDeServicio) {
      throw new NotFoundException(`TiposDeServicio con ID ${id} no encontrado`);
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