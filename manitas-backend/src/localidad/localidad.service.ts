import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLocalidadDto } from './dto/create-localidad.dto';
import { UpdateLocalidadDto } from './dto/update-localidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Localidad } from './entities/localidad.entity';
import { Repository } from 'typeorm';
import { Provincia } from '../provincia/entities/provincia.entity';

@Injectable()
export class LocalidadService {
constructor(
  @InjectRepository(Localidad)
  private readonly localidadRepository: Repository<Localidad>,

  @InjectRepository(Provincia)
  private readonly provinciaRepository: Repository<Provincia>

) {}


  async create(createLocalidadDto: CreateLocalidadDto) {
    const provincia = await this.provinciaRepository.findOneBy({
      idProvincia: createLocalidadDto.idProvincia});

    if (!provincia) {
    throw new BadRequestException('La provincia indicada no existe');
  }

  return await this.localidadRepository.save({
    ...createLocalidadDto,
    provincia,
  });
  }

  async findAll() {
    return await this.localidadRepository.find();
  }

  async findOne(id: number) {
    const localidad = await this.localidadRepository.findOneBy({idLocalidad:id});
    if (!localidad) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }
    return localidad;
  }

  async update(id: number, updateLocalidadDto: UpdateLocalidadDto) {
    const localidad = await this.findOne(id);
    this.localidadRepository.merge(localidad, updateLocalidadDto);
    return await this.localidadRepository.save(localidad);
  }

  async remove(id: number) {
    return await this.localidadRepository.softDelete({idLocalidad:id});
  }
}