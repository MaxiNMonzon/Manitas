import { Injectable } from '@nestjs/common';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionService {
  create(createPromocionDto: CreatePromocionDto) {
    return 'This action adds a new promocion';
  }

  findAll() {
    return `This action returns all promocion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} promocion`;
  }

  update(id: number, updatePromocionDto: UpdatePromocionDto) {
    return `This action updates a #${id} promocion`;
  }

  remove(id: number) {
    return `This action removes a #${id} promocion`;
  }
}
