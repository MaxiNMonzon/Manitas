import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';

@Injectable()
export class PromocionService {
constructor(
  @InjectRepository(Promocion)
  private readonly promocionRepository: Repository<Promocion>,

  @InjectRepository(MetodoDePago)
  private readonly metodoDePagoRepository: Repository<MetodoDePago>,
) {}

  async create(createPromocionDto: CreatePromocionDto) {
    let metodosPago: MetodoDePago[] = [];
    if (createPromocionDto.idsMetodosPago && createPromocionDto.idsMetodosPago.length > 0) {
      metodosPago = await this.metodoDePagoRepository.findBy({
        idFormaPago: In(createPromocionDto.idsMetodosPago),
      });

      if (metodosPago.length !== createPromocionDto.idsMetodosPago.length) {
        throw new BadRequestException('Alguno de los métodos de pago indicados no existen');
      }
    }

    return await this.promocionRepository.save({
      ...createPromocionDto,
      metodosPago,
    });
  }

  async findAll() {
    return await this.promocionRepository.find();
  }

  async findOne(id: number) {
    const promocion = await this.promocionRepository.findOneBy({ idPromocion: id });
    if (!promocion) {
      throw new NotFoundException(`Promocion con ID ${id} no encontrada`);
    }
    return promocion;
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    const promocion = await this.findOne(id);
    this.promocionRepository.merge(promocion, updatePromocionDto);
    return await this.promocionRepository.save(promocion);
  }

  async remove(id: number) {
    return await this.promocionRepository.softDelete({ idPromocion: id });
  }
}
