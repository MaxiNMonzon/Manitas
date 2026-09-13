import { Injectable } from '@nestjs/common';
import { CreatePrecioBaseDto } from './dto/create-precio-base.dto';
import { UpdatePrecioBaseDto } from './dto/update-precio-base.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrecioBase } from './entities/precio-base.entity';

@Injectable()
export class PrecioBaseService {
constructor(
  @InjectRepository (PrecioBase)
  private readonly preciobaseRepository: Repository<PrecioBase>
){}

async create(createPrecioBaseDto: CreatePrecioBaseDto) {
    return await this.preciobaseRepository.save(createPrecioBaseDto);
  }
  
// OJOOOO!!! Falta completar relacion de  profesional y especialidad

async findAll() {
    return await this.preciobaseRepository.find();
  }

async findOne(id: number) {
    return await this.preciobaseRepository.findOneBy({idPrecio: id});
  }

async update(id: number, updatePrecioBaseDto: UpdatePrecioBaseDto) {
    return await this.preciobaseRepository.update(id, updatePrecioBaseDto);
  }

async remove(id: number) {
    return await this.preciobaseRepository.softDelete({idPrecio: id});
  }
}
