import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePrecioBaseDto } from './dto/create-precio-base.dto';
import { UpdatePrecioBaseDto } from './dto/update-precio-base.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrecioBase } from './entities/precio-base.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Profesional } from '../profesional/entities/profesional.entity';

@Injectable()
export class PrecioBaseService {
constructor(
  @InjectRepository (PrecioBase)
  private readonly preciobaseRepository: Repository<PrecioBase>,

  @InjectRepository(Especialidad)
  private readonly especialidadRepository: Repository<Especialidad>,

  @InjectRepository(Profesional)
  private readonly profesionalRepository: Repository<Profesional>,
){}

async create(createPrecioBaseDto: CreatePrecioBaseDto) {
  const especialidad = await this.especialidadRepository.findOneBy({
    idEspecialidad: createPrecioBaseDto.idEspecialidad,
  });

  if (!especialidad) {
    throw new BadRequestException('La especialidad indicada no existe');
  }

  const profesional = await this.profesionalRepository.findOneBy({
    idUsuario: createPrecioBaseDto.idProfesional,
  });

  if (!profesional) {
    throw new BadRequestException('El profesional indicado no existe');
  }

  return await this.preciobaseRepository.save({
    ...createPrecioBaseDto,
    especialidad,
    profesional,
  });
}

async findAll() {
    return await this.preciobaseRepository.find();
  }

async findOne(id: number) {
    const precioBase = await this.preciobaseRepository.findOneBy({idPrecio: id});
    if (!precioBase) {
      throw new NotFoundException(`PrecioBase con ID ${id} no encontrado`);
    }
    return precioBase;
  }

async update(id: number, updatePrecioBaseDto: UpdatePrecioBaseDto) {
    const precioBase = await this.findOne(id);
    this.preciobaseRepository.merge(precioBase, updatePrecioBaseDto);
    return await this.preciobaseRepository.save(precioBase);
  }

async remove(id: number) {
    return await this.preciobaseRepository.softDelete({idPrecio: id});
  }
}
