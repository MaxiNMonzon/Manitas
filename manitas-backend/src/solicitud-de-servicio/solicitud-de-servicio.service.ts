import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';

@Injectable()
export class SolicitudDeServicioService {
  constructor(
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudDeServicioRepository: Repository<SolicitudDeServicio>,

    @InjectRepository(MetodoDePago)
    private readonly metodoDePagoRepository: Repository<MetodoDePago>,
  ) {}

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto) {
    const metodoPago = await this.metodoDePagoRepository.findOneBy({
      idFormaPago: createSolicitudDeServicioDto.idMetodoPago,
    });

    if (!metodoPago) {
      throw new BadRequestException('El metodo de pago indicado no existe');
    }

    // OJOOOO!!! Falta completar relacion de cliente y profesional cuando Mica termine esas entidades

    return await this.solicitudDeServicioRepository.save({
      ...createSolicitudDeServicioDto,
      metodoPago,
    });
  }

  async findAll() {
    return await this.solicitudDeServicioRepository.find();
  }

  async findOne(id: number) {
    return await this.solicitudDeServicioRepository.findOneBy({ idSolicitud: id });
  }

  async update(id: number, updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto) {
    return await this.solicitudDeServicioRepository.update(id, updateSolicitudDeServicioDto);
  }

  async remove(id: number) {
    return await this.solicitudDeServicioRepository.softDelete({ idSolicitud: id });
  }
}
