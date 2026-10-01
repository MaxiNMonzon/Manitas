import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './entities/zona.entity';
import { Localidad } from '../localidad/entities/localidad.entity';



@Injectable()
export class ZonaService {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
  
    @InjectRepository(Localidad)
    private readonly localidadRepository: Repository<Localidad>,
  ) {}

    async create(createZonaDto: CreateZonaDto): Promise<Zona> {
    const localidad = await this.localidadRepository.findOneBy({
      idLocalidad: createZonaDto.idLocalidad,
    });
    if (!localidad) {
      throw new BadRequestException('La localidad indicada no existe');
    }

    return await this.zonaRepository.save(
      this.zonaRepository.create({
        nombreZona: createZonaDto.nombreZona,
        localidad,
      }),
    );
  }

   async findAll(): Promise<Zona[]> {
    return await this.zonaRepository.find();
  }

  async findOne(id: number): Promise<Zona> {
    const zona = await this.zonaRepository.findOneBy({ idZona: id });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    return zona;
  }

  async update(id: number, updateZonaDto: UpdateZonaDto): Promise<Zona> {
    const zona = await this.findOne(id);
    const { idLocalidad, ...resto } = updateZonaDto;

    if (idLocalidad !== undefined) {
      const localidad = await this.localidadRepository.findOneBy({ idLocalidad });
      if (!localidad) {
        throw new BadRequestException('La localidad indicada no existe');
      }
      zona.localidad = localidad;
    }

    this.zonaRepository.merge(zona, resto);
    return await this.zonaRepository.save(zona);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.zonaRepository.softDelete({ idZona: id });
    return { message: `Zona con ID ${id} eliminada con éxito` };
  }
}
