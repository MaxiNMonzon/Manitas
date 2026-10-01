import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { CalificarServicioDto } from './dto/calificar-servicio.dto';
import { CalificarProfesionalDto } from '../profesional/dto/calificar-profesional.dto';

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

  async calificarServicio(
    idSolicitud: number,
    calificarServicioDto: CalificarServicioDto,
  ): Promise<SolicitudDeServicio> {
    const solicitud = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud },
      relations: ['cliente', 'profesional'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud de servicio con ID ${idSolicitud} no encontrada`);
    }

    // Validación de negocio: solo se puede calificar un servicio completado/finalizado
    if (solicitud.estadoServicio !== 'FINALIZADO') {
      throw new BadRequestException('Solo se pueden calificar servicios en estado FINALIZADO');
    }

    solicitud.calificacionServicio = calificarServicioDto.calificacion;
    solicitud.reseñaServicio = calificarServicioDto.reseña || '';

    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  async calificarProfesional(
    idSolicitud: number,
    calificarProfesionalDto: CalificarProfesionalDto,
  ): Promise<SolicitudDeServicio> {
    // Reutiliza la misma persistencia de la solicitud o mapea los datos requeridos
    return await this.calificarServicio(idSolicitud, calificarProfesionalDto);
  }

  /**
   * Obtiene el promedio de calificaciones de un profesional
   */
  async obtenerPromedioProfesional(idProfesional: number): Promise<{ promedio: number; totalReseñas: number }> {
    const resultado = await this.solicitudDeServicioRepository
      .createQueryBuilder('solicitud')
      .select('AVG(solicitud.calificacionServicio)', 'promedio')
      .addSelect('COUNT(solicitud.calificacionServicio)', 'totalReseñas')
      .where('solicitud.profesional.idUsuario = :idProfesional', { idProfesional })
      .andWhere('solicitud.calificacionServicio IS NOT NULL')
      .getRawOne();

    return {
      promedio: parseFloat(resultado.promedio) || 0,
      totalReseñas: parseInt(resultado.totalReseñas, 10) || 0,
    };
  }
}