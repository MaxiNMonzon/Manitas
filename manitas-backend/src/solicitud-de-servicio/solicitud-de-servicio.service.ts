import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Rol } from '../common/enums/rol.enum';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { AgendarDto } from './dto/agendar.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

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

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, idCliente: number) {
    const cliente = await this.clienteRepository.findOneBy({
      idUsuario: idCliente,
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

    // El estado y las fechas los pone el sistema, no el cliente.
    // El costo de visita se copia para que no cambie si el profesional sube su tarifa despues
    return await this.solicitudDeServicioRepository.save({
      ...createSolicitudDeServicioDto,
      estadoServicio: EstadoSolicitud.SOLICITADO,
      fechaCambioEstado: new Date(),
      costoVisita: profesional.costoVisita,
      cliente,
      profesional,
    });
  }

  async findAll(usuario: UsuarioActivoInterface) {
    let solicitudes: SolicitudDeServicio[];
    if (usuario.rol === Rol.CLIENTE) {
      solicitudes = await this.solicitudDeServicioRepository.find({
        where: { cliente: { idUsuario: usuario.sub } },
      });
    } else {
      solicitudes = await this.solicitudDeServicioRepository.find({
        where: { profesional: { idUsuario: usuario.sub } },
      });
    }

    for (const solicitud of solicitudes) {
      await this.revisarVencimiento(solicitud);
    }
    return solicitudes;
  }

  async findOne(id: number, usuario: UsuarioActivoInterface) {
    const solicitudDeServicio = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud: id },
      relations: { cliente: true, profesional: true, metodoPago: true },
    });
    if (!solicitudDeServicio) {
      throw new NotFoundException(`SolicitudDeServicio con ID ${id} no encontrada`);
    }

    const esElCliente = usuario.rol === Rol.CLIENTE && solicitudDeServicio.cliente?.idUsuario === usuario.sub;
    const esElProfesional = usuario.rol === Rol.PROFESIONAL && solicitudDeServicio.profesional?.idUsuario === usuario.sub;
    if (!esElCliente && !esElProfesional) {
      throw new ForbiddenException('No participás de esta solicitud');
    }

    await this.revisarVencimiento(solicitudDeServicio);
    return solicitudDeServicio;
  }

  async update(id: number, updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto, usuario: UsuarioActivoInterface) {
    const solicitudDeServicio = await this.findOne(id, usuario);
    if (usuario.rol !== Rol.CLIENTE) {
      throw new ForbiddenException('Solo el cliente puede modificar la descripcion');
    }
    if (solicitudDeServicio.estadoServicio !== EstadoSolicitud.SOLICITADO) {
      throw new BadRequestException('Solo se puede modificar mientras el profesional no la haya aceptado');
    }
    this.solicitudDeServicioRepository.merge(solicitudDeServicio, updateSolicitudDeServicioDto);
    return await this.solicitudDeServicioRepository.save(solicitudDeServicio);
  }

  // ---------- Pasos del profesional ----------

  async aceptar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    return await this.cambiarEstado(solicitud, EstadoSolicitud.EN_COORDINACION);
  }

  async rechazar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    return await this.cambiarEstado(solicitud, EstadoSolicitud.RECHAZADO);
  }

  async agendar(id: number, agendarDto: AgendarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.EN_COORDINACION]);

    const fecha = new Date(agendarDto.fecha);
    if (fecha <= new Date()) {
      throw new BadRequestException('La fecha tiene que ser en el futuro');
    }

    // Si todavia no hay presupuesto aceptado es la visita, si ya hay es el trabajo
    if (solicitud.costoEstimado == null) {
      solicitud.fechaVisita = fecha;
    } else {
      solicitud.fechaInicio = fecha;
    }
    return await this.cambiarEstado(solicitud, EstadoSolicitud.AGENDADO);
  }

  async presupuestar(id: number, presupuestarDto: PresupuestarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.AGENDADO]);

    // La primera vez es el presupuesto. Si ya habia uno, es un cambio de precio
    // a mitad del trabajo: el costoEstimado queda como estaba y cambia el costoFinal
    if (solicitud.costoEstimado == null) {
      solicitud.costoEstimado = presupuestarDto.costo;
    }
    solicitud.costoFinal = presupuestarDto.costo;
    return await this.cambiarEstado(solicitud, EstadoSolicitud.PRESUPUESTADO);
  }

  // ---------- Pasos del cliente ----------

  async aceptarPresupuesto(id: number, aceptarPresupuestoDto: AceptarPresupuestoDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.PRESUPUESTADO]);

    // Si el trabajo ya habia arrancado (cambio de precio) vuelve a agendado
    if (solicitud.fechaInicio) {
      return await this.cambiarEstado(solicitud, EstadoSolicitud.AGENDADO);
    }
    // Trabajo chico: se hace ahora, en la visita
    if (aceptarPresupuestoDto.enElMomento) {
      solicitud.fechaInicio = new Date();
      return await this.cambiarEstado(solicitud, EstadoSolicitud.AGENDADO);
    }
    // Trabajo grande: hay que coordinar la fecha del trabajo
    return await this.cambiarEstado(solicitud, EstadoSolicitud.EN_COORDINACION);
  }

  async rechazarPresupuesto(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.PRESUPUESTADO]);

    // Si rechaza despues de la visita, se cobra solo la visita (si el profesional la cobra)
    if (!solicitud.fechaInicio) {
      solicitud.costoFinal = solicitud.costoVisita;
    }
    return await this.cambiarEstado(solicitud, EstadoSolicitud.RECHAZADO);
  }

  // ---------- Pasos de los dos ----------

  async reprogramar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.AGENDADO]);
    return await this.cambiarEstado(solicitud, EstadoSolicitud.EN_COORDINACION);
  }

  async cancelar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO, EstadoSolicitud.EN_COORDINACION, EstadoSolicitud.AGENDADO]);

    if (solicitud.costoEstimado != null) {
      throw new BadRequestException('No se puede cancelar porque el presupuesto ya fue aceptado');
    }

    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      const horasQueFaltan = (solicitud.fechaVisita.getTime() - Date.now()) / (1000 * 60 * 60);
      if (horasQueFaltan < 12) {
        throw new BadRequestException('Solo se puede cancelar hasta 12 hs antes de la visita');
      }
    }
    return await this.cambiarEstado(solicitud, EstadoSolicitud.CANCELADO);
  }

  // ---------- Ayudas ----------

  private validarEstado(solicitud: SolicitudDeServicio, estadosPermitidos: EstadoSolicitud[]) {
    if (!estadosPermitidos.includes(solicitud.estadoServicio)) {
      throw new BadRequestException(`No se puede hacer esto con la solicitud en estado ${solicitud.estadoServicio}`);
    }
  }

  private async cambiarEstado(solicitud: SolicitudDeServicio, nuevoEstado: EstadoSolicitud) {
    solicitud.estadoServicio = nuevoEstado;
    solicitud.fechaCambioEstado = new Date();
    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  // Si pasaron 48 hs sin respuesta (Solicitado) o sin fecha cargada (EnCoordinacion), vence
  private async revisarVencimiento(solicitud: SolicitudDeServicio) {
    const puedeVencer = solicitud.estadoServicio === EstadoSolicitud.SOLICITADO || solicitud.estadoServicio === EstadoSolicitud.EN_COORDINACION;
    const horasPasadas = (Date.now() - solicitud.fechaCambioEstado.getTime()) / (1000 * 60 * 60);
    if (puedeVencer && horasPasadas >= 48) {
      solicitud.estadoServicio = EstadoSolicitud.EXPIRADO;
      await this.solicitudDeServicioRepository.save(solicitud);
    }
  }
}
