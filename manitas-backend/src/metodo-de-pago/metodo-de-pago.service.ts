import { Injectable } from '@nestjs/common';
import { CreateMetodoDePagoDto } from './dto/create-metodo-de-pago.dto';
import { UpdateMetodoDePagoDto } from './dto/update-metodo-de-pago.dto';

@Injectable()
export class MetodoDePagoService {
  create(createMetodoDePagoDto: CreateMetodoDePagoDto) {
    return 'This action adds a new metodoDePago';
  }

  findAll() {
    return `This action returns all metodoDePago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} metodoDePago`;
  }

  update(id: number, updateMetodoDePagoDto: UpdateMetodoDePagoDto) {
    return `This action updates a #${id} metodoDePago`;
  }

  remove(id: number) {
    return `This action removes a #${id} metodoDePago`;
  }
}
