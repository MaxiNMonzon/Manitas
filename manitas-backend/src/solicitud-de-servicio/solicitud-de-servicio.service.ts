import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { CalificarServicioDto } from './dto/calificar-servicio.dto';
import { CalificarProfesionalDto } from '../profesional/dto/calificar-profesional.dto';
import { SolicitarPresupuestoDto } from './dto/solicitar-presupuesto.dto';
import { EmitirPresupuestoDto } from './dto/emitir-presupuesto.dto';
import { AbonarServicioDto } from './dto/abonar-servicio.dto';
import { CoordinarVisitaDto } from './dto/coordinar-visita.dto';
import { SolicitarServicioDto } from './dto/solicitar-servicio.dto';
import { ConfirmarServicioDto } from './dto/confirmar-servicio.dto';

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
    const metodoDePago = await this.metodoDePagoRepository.findOneBy({
      idFormaPago: createSolicitudDeServicioDto.idMetodoDePago,
    });

    if (!metodoDePago) {
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
      metodoDePago,
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
        metodoDePago: true,
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
  async solicitarPresupuesto(solicitarDto: SolicitarPresupuestoDto): Promise<SolicitudDeServicio> {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: solicitarDto.idCliente });
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: solicitarDto.idProfesional });
    if (!profesional) {
      throw new BadRequestException('El profesional indicado no existe');
    }

    const metodoDePago = await this.metodoDePagoRepository.findOneBy({ idFormaPago: solicitarDto.idMetodoDePago });
    if (!metodoDePago) {
      throw new BadRequestException('El método de pago indicado no existe');
    }

    const nuevaSolicitud = this.solicitudDeServicioRepository.create({
      estadoServicio: 'PENDIENTE_PRESUPUESTO',
      visitaPrevia: solicitarDto.visitaPrevia,
      fechaSolicitud: solicitarDto.fechaSolicitud,
      fechaVisita: solicitarDto.fechaVisita ? new Date(solicitarDto.fechaVisita) : undefined,
      horaInicio: solicitarDto.horaInicio,
      horaFinEstimada: solicitarDto.horaFinEstimada || '00:00',
      duracionEstimada: solicitarDto.duracionEstimada || 0,
      costoEstimado: solicitarDto.costoEstimado || 0,
      cliente,
      profesional,
      metodoDePago,
    });

    return await this.solicitudDeServicioRepository.save(nuevaSolicitud);
  }

  async emitirPresupuesto(idSolicitud: number, emitirDto: EmitirPresupuestoDto): Promise<SolicitudDeServicio> {
    const solicitud = await this.findOne(idSolicitud);

    if (solicitud.estadoServicio !== 'PENDIENTE_PRESUPUESTO') {
      throw new BadRequestException('Solo se pueden presupuestar solicitudes en estado PENDIENTE_PRESUPUESTO');
    }

    solicitud.costoEstimado = emitirDto.costoEstimado;
    solicitud.duracionEstimada = emitirDto.duracionEstimada;
    solicitud.horaFinEstimada = emitirDto.horaFinEstimada;
    solicitud.estadoServicio = 'PRESUPUESTADO';

    return await this.solicitudDeServicioRepository.save(solicitud);
  }
  async abonarServicio(idSolicitud: number, abonarDto: AbonarServicioDto): Promise<SolicitudDeServicio> {
    const solicitud = await this.findOne(idSolicitud);

    if (solicitud.estadoServicio === 'ABONADO' || solicitud.estadoServicio === 'PAGADO') {
      throw new BadRequestException('Esta solicitud de servicio ya se encuentra abonada');
    }

    if (solicitud.estadoServicio === 'CANCELADO') {
      throw new BadRequestException('No se puede abonar una solicitud cancelada');
    }

    const metodoDePago = await this.metodoDePagoRepository.findOneBy({ idFormaPago: abonarDto.idMetodoDePago });
    if (!metodoDePago) {
      throw new BadRequestException('El método de pago indicado no existe');
    }

    if (metodoDePago.estado !== 'ACTIVO') {
      throw new BadRequestException('El método de pago seleccionado no está disponible');
    }

    solicitud.metodoDePago = metodoDePago;
    solicitud.costoFinal = abonarDto.montoAbonado;
    solicitud.estadoServicio = 'ABONADO';

    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  async coordinarVisita(
    idSolicitud: number,
    coordinarVisitaDto: CoordinarVisitaDto,
  ): Promise<SolicitudDeServicio> {
    const solicitud = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud },
      relations: ['cliente', 'profesional'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud de servicio con ID ${idSolicitud} no encontrada`);
    }

    if (!solicitud.visitaPrevia) {
      throw new BadRequestException('Esta solicitud de servicio no requiere visita previa');
    }

    if (solicitud.estadoServicio === 'CANCELADO' || solicitud.estadoServicio === 'FINALIZADO') {
      throw new BadRequestException(
        `No se puede coordinar una visita para una solicitud en estado ${solicitud.estadoServicio}`,
      );
    }

    const fechaVisita = new Date(coordinarVisitaDto.fechaVisita);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaVisita < hoy) {
      throw new BadRequestException('La fecha de la visita no puede ser anterior a la fecha actual');
    }

    solicitud.fechaVisita = fechaVisita;
    solicitud.horaInicio = coordinarVisitaDto.horaInicio;
    solicitud.estadoServicio = 'VISITA_COORDINADA';

    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  /**
   * Obtiene las visitas programadas dentro de un rango de días (por defecto, las próximas 24-48 horas)
   * para generar notificaciones a clientes o profesionales.
   */
  async obtenerProximasVisitas(diasAviso: number = 1): Promise<SolicitudDeServicio[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + diasAviso);
    fechaLimite.setHours(23, 59, 59, 999);

    const proximasVisitas = await this.solicitudDeServicioRepository.find({
      where: {
        visitaPrevia: true,
        estadoServicio: 'VISITA_COORDINADA',
        fechaVisita: Between(hoy, fechaLimite),
      },
      relations: {
        cliente: true,
        profesional: true,
      },
      order: {
        fechaVisita: 'ASC',
        horaInicio: 'ASC',
      },
    });

    return proximasVisitas;
  }

  /**
   * Procesa y simula/envía el despacho de notificaciones para las visitas próximas.
   */
  async notificarProximasVisitas(diasAviso: number = 1): Promise<{ notificadas: number; detalles: any[] }> {
    const visitas = await this.obtenerProximasVisitas(diasAviso);

    const detalles = visitas.map((solicitud) => ({
      idSolicitud: solicitud.idSolicitud,
      fechaVisita: solicitud.fechaVisita,
      horaInicio: solicitud.horaInicio,
      cliente: {
        id: solicitud.cliente?.idUsuario,
        nombre: `${solicitud.cliente?.nombre} ${solicitud.cliente?.apellido}`,
        correo: solicitud.cliente?.correo,
      },
      profesional: {
        id: solicitud.profesional?.idUsuario,
        nombre: `${solicitud.profesional?.nombre} ${solicitud.profesional?.apellido}`,
        correo: solicitud.profesional?.correo,
      },
      mensaje: `Recordatorio: Tienes una visita técnica programada para el día ${solicitud.fechaVisita} a las ${solicitud.horaInicio}.`,
    }));

    return {
      notificadas: detalles.length,
      detalles,
    };
  }
  async solicitarServicio(solicitarDto: SolicitarServicioDto): Promise<SolicitudDeServicio> {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: solicitarDto.idCliente });
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: solicitarDto.idProfesional });
    if (!profesional) {
      throw new BadRequestException('El profesional indicado no existe');
    }

    const metodoDePago = await this.metodoDePagoRepository.findOneBy({ idFormaPago: solicitarDto.idMetodoDePago });
    if (!metodoDePago) {
      throw new BadRequestException('El método de pago indicado no existe');
    }

    if (metodoDePago.estado !== 'ACTIVO') {
      throw new BadRequestException('El método de pago seleccionado no está activo');
    }

    const nuevaSolicitud = this.solicitudDeServicioRepository.create({
      estadoServicio: 'PENDIENTE_CONFIRMACION',
      visitaPrevia: solicitarDto.visitaPrevia ?? false,
      fechaSolicitud: new Date(solicitarDto.fechaSolicitud),
      horaInicio: solicitarDto.horaInicio,
      horaFinEstimada: solicitarDto.horaFinEstimada,
      duracionEstimada: solicitarDto.duracionEstimada,
      costoEstimado: solicitarDto.costoEstimado,
      cliente,
      profesional,
      metodoDePago,
    });

    return await this.solicitudDeServicioRepository.save(nuevaSolicitud);
  }
  async confirmarServicio(
    idSolicitud: number,
    confirmarDto?: ConfirmarServicioDto,
  ): Promise<SolicitudDeServicio> {
    const solicitud = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud },
      relations: ['cliente', 'profesional', 'metodoDePago'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud de servicio con ID ${idSolicitud} no encontrada`);
    }

    // Solo se pueden confirmar solicitudes pendientes o presupuestadas
    const estadosValidos = ['PENDIENTE_CONFIRMACION', 'PRESUPUESTADO', 'VISITA_COORDINADA'];
    if (!estadosValidos.includes(solicitud.estadoServicio)) {
      throw new BadRequestException(
        `No se puede confirmar una solicitud en estado ${solicitud.estadoServicio}`,
      );
    }

    if (confirmarDto?.fechaVisita) {
      solicitud.fechaVisita = new Date(confirmarDto.fechaVisita);
    }

    solicitud.estadoServicio = 'CONFIRMADO';

    return await this.solicitudDeServicioRepository.save(solicitud);
  }
}