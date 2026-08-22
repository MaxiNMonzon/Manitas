import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Localidad } from '../entities/Localidad';

@Injectable()
export class LocalidadService {

  constructor(
    @InjectRepository(Localidad)
    private readonly localidadRepository: Repository<Localidad>,
  ) {}

  async obtenerTodas(): Promise<Localidad[]> {
    return this.localidadRepository.find({
      relations: ['provincia', 'zonas'],
    });
  }

  async obtenerPorId(id: number): Promise<Localidad> {

    const localidad = await this.localidadRepository.findOne({
      where: { idLocalidad: id },
      relations: ['provincia', 'zonas'],
    });

    if (!localidad) {
      throw new NotFoundException('Localidad no encontrada');
    }

    return localidad;
  }

  async agregar(localidad: Localidad): Promise<Localidad> {
    return this.localidadRepository.save(localidad);
  }

  async modificar(
    id: number,
    datos: Partial<Localidad>,
  ): Promise<Localidad> {

    const localidad = await this.obtenerPorId(id);

    Object.assign(localidad, datos);

    return this.localidadRepository.save(localidad);
  }

  async eliminar(id: number): Promise<void> {

    const localidad = await this.obtenerPorId(id);

    await this.localidadRepository.remove(localidad);
  }
}