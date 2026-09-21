import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMetodoDePagoDto } from './dto/create-metodo-de-pago.dto';
import { UpdateMetodoDePagoDto } from './dto/update-metodo-de-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MetodoDePago } from './entities/metodo-de-pago.entity';
import { Promocion } from '../promocion/entities/promocion.entity';

@Injectable()
export class MetodoDePagoService {
constructor(
  @InjectRepository(MetodoDePago)
  private readonly metodoDePagoRepository: Repository<MetodoDePago>,

  @InjectRepository(Promocion)
  private readonly promocionRepository: Repository<Promocion>,
) {}

  async create(createMetodoDePagoDto: CreateMetodoDePagoDto) {
    let promociones: Promocion[] = [];
    if (createMetodoDePagoDto.idsPromociones && createMetodoDePagoDto.idsPromociones.length > 0) {
      promociones = await this.promocionRepository.findBy({
        idPromocion: In(createMetodoDePagoDto.idsPromociones),
      });

      if (promociones.length !== createMetodoDePagoDto.idsPromociones.length) {
        throw new BadRequestException('Alguna de las promociones indicadas no existen');
      }
    }

    return await this.metodoDePagoRepository.save({
      ...createMetodoDePagoDto,
      promociones,
    });
  }

  async findAll() {
    return await this.metodoDePagoRepository.find();
  }

  async findOne(id: number) {
    return await this.metodoDePagoRepository.findOneBy({ idFormaPago: id });
  }

  async update(id: number, updateMetodoDePagoDto: UpdateMetodoDePagoDto) {
    return await this.metodoDePagoRepository.update(id, updateMetodoDePagoDto);
  }

  async remove(id: number) {
    return await this.metodoDePagoRepository.softDelete({ idFormaPago: id });
  }
}
