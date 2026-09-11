import { Injectable } from '@nestjs/common';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';

@Injectable()
export class TiposDeServicioService {
  create(createTiposDeServicioDto: CreateTiposDeServicioDto) {
    return 'This action adds a new tiposDeServicio';
  }

  findAll() {
    return `This action returns all tiposDeServicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiposDeServicio`;
  }

  update(id: number, updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return `This action updates a #${id} tiposDeServicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} tiposDeServicio`;
  }
}
