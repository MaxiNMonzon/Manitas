import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
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

   async create(createZonaDto: CreateZonaDto) {
    const localidad = await this.localidadRepository.findOneBy({idLocalidad:createZonaDto.idLocalidad}) ;

    if (!localidad) {
        throw new BadRequestException('La localidad indicada no existe');
      }
    
    return await this.zonaRepository.save({
        ...createZonaDto,
        localidad,
      });
  }

async findAll(idLocalidad?: number) {
    return await this.zonaRepository.find({
      where: idLocalidad ? { localidad: { idLocalidad } } : {},
      relations: { localidad: true },
    });
  }
   async findOne(id: number) {
    const zona = await this.zonaRepository.findOne({
      where: { idZona: id },
      relations: { localidad: { provincia: true } },
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    return zona;
  }

  async update(id: number, updateZonaDto: UpdateZonaDto) {
    const zona = await this.findOne(id);
    this.zonaRepository.merge(zona, updateZonaDto);
    return await this.zonaRepository.save(zona);
  }

  async remove(id: number) {
    return await this.zonaRepository.softDelete({idZona:id}) ;
  }
  
 
}