import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';

@Injectable()
export class SolicitudDeServicioService {
  constructor(
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudDeServicioRepository: Repository<SolicitudDeServicio>,

    @InjectRepository(MetodoDePago)
    private readonly metodoDePagoRepository: Repository<MetodoDePago>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
  ) {}

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto) {
    const metodoPago = await this.metodoDePagoRepository.findOneBy({
      idFormaPago: createSolicitudDeServicioDto.idMetodoPago,
    });

    if (!metodoPago) {
      throw new BadRequestException('El metodo de pago indicado no existe');
    }

    const cliente = await this.clienteRepository.findOneBy({
      idUsuario: createSolicitudDeServicioDto.idCliente,
    });

    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const profesional = await this.profesionalRepository.findOneBy({
      idUsuario: createSolicitudDeServicioDto.idProfesional,
    });

    if (!profesional) {
      throw new BadRequestException('El profesional indicado no existe');
    }

    return await this.solicitudDeServicioRepository.save({
      ...createSolicitudDeServicioDto,
      metodoPago,
      cliente,
      profesional,
    });
  }

  async findAll(idCliente?: number, idProfesional?: number): Promise<SolicitudDeServicio[]> {
  const query = this.solicitudDeServicioRepository
    .createQueryBuilder('solicitud')
    .leftJoinAndSelect('solicitud.cliente', 'cliente')
    .leftJoinAndSelect('solicitud.profesional', 'profesional')
    .leftJoinAndSelect('solicitud.metodoDePago', 'metodoDePago');

  if (idCliente) {
    query.andWhere('cliente.idUsuario = :idCliente', { idCliente });
  }

  if (idProfesional) {
    query.andWhere('profesional.idUsuario = :idProfesional', { idProfesional });
  }

  return await query.getMany();
}

  async findOne(id: number) {
    const solicitudDeServicio = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud: id },
      relations: {
        cliente: true,
        profesional: true,
        metodoPago: true,
      },
    });
    if (!solicitudDeServicio) {
      throw new NotFoundException(`SolicitudDeServicio con ID ${id} no encontrada`);
    }
    return solicitudDeServicio;
  }

  async update(id: number, updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto) {
    const solicitudDeServicio = await this.findOne(id);
    this.solicitudDeServicioRepository.merge(solicitudDeServicio, updateSolicitudDeServicioDto);
    return await this.solicitudDeServicioRepository.save(solicitudDeServicio);
  }

  async remove(id: number) {
    return await this.solicitudDeServicioRepository.softDelete({ idSolicitud: id });
  }
}
