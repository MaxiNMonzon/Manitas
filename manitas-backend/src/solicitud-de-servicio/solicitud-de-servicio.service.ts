import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { Tarjeta } from '../tarjeta/entities/tarjeta.entity';
import { PagarDto } from './dto/pagar.dto';
import { mejorPromocionVigente } from '../promocion/mejor-promocion';
import { CalificarDto } from './dto/calificar.dto';
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

    @InjectRepository(Tarjeta)
    private readonly tarjetaRepository: Repository<Tarjeta>,

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
      relations: { cliente: true, profesional: true, tarjeta: { metodoDePago: true } },
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
      // Sin milisegundos: MySQL los redondea y podia quedar un segundo en el futuro
      const ahora = new Date();
      ahora.setMilliseconds(0);
      solicitud.fechaInicio = ahora;
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

  // Paga el trabajo (Agendado -> Finalizado) o solo la visita si rechazo el presupuesto (queda Rechazado).
  // Se cobra siempre el precio completo: el descuento de la promo lo reintegra el banco
  async pagar(id: number, pagarDto: PagarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.AGENDADO, EstadoSolicitud.RECHAZADO]);

    if (solicitud.tarjeta) {
      throw new BadRequestException('Esta solicitud ya fue pagada');
    }

    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      if (solicitud.costoEstimado == null) {
        throw new BadRequestException('Todavia no hay un presupuesto aceptado para pagar');
      }
      if (solicitud.fechaInicio > new Date()) {
        throw new BadRequestException('Todavia no llego la fecha del trabajo');
      }
    }

    // En Rechazado solo se paga la visita (si el profesional la cobra)
    if (solicitud.estadoServicio === EstadoSolicitud.RECHAZADO && (!solicitud.costoFinal || solicitud.fechaInicio)) {
      throw new BadRequestException('No hay nada para pagar');
    }

    // La tarjeta tiene que ser del cliente, no estar vencida y su metodo estar activo
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { idTarjeta: pagarDto.idTarjeta, cliente: { idUsuario: usuario.sub } },
      relations: { metodoDePago: { promociones: true } },
    });
    if (!tarjeta) {
      throw new BadRequestException('Esa tarjeta no existe o no es tuya');
    }
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    if (tarjeta.anioVencimiento < anioActual || (tarjeta.anioVencimiento === anioActual && tarjeta.mesVencimiento < mesActual)) {
      throw new BadRequestException('La tarjeta esta vencida');
    }
    if (tarjeta.metodoDePago.estado !== 'activo') {
      throw new BadRequestException('Ese metodo de pago no esta disponible');
    }

    // De las promos vigentes hoy para ese metodo, la de mayor descuento
    const mejorPromocion = mejorPromocionVigente(tarjeta.metodoDePago.promociones);

    solicitud.tarjeta = tarjeta;
    let guardada: SolicitudDeServicio;
    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      solicitud.fechaFinReal = new Date();
      guardada = await this.cambiarEstado(solicitud, EstadoSolicitud.FINALIZADO);
    } else {
      guardada = await this.solicitudDeServicioRepository.save(solicitud);
    }

    let reintegro: object | null = null;
    if (mejorPromocion) {
      const porcentaje = Number(mejorPromocion.porcentajeDescuento);
      const dondeSeVe = tarjeta.metodoDePago.tipo.toLowerCase().includes('crédito')
        ? 'en el resumen de tu tarjeta'
        : 'en tu cuenta';
      reintegro = {
        promocion: mejorPromocion.descripcion,
        porcentaje,
        montoEstimado: Math.round((solicitud.costoFinal * porcentaje) / 100),
        mensaje: `Tenes ${porcentaje}% de reintegro, te lo devuelve el banco ${dondeSeVe}`,
      };
    }

    return { solicitud: guardada, reintegro };
  }

  // Calificar al profesional: solo una vez y con el trabajo terminado
  async calificar(id: number, calificarDto: CalificarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.FINALIZADO]);

    if (solicitud.calificacionServicio != null) {
      throw new BadRequestException('Esta solicitud ya fue calificada');
    }

    solicitud.calificacionServicio = calificarDto.calificacionServicio;
    if (calificarDto.reseñaServicio) {
      solicitud.reseñaServicio = calificarDto.reseñaServicio;
    }
    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  // ---------- Avisos dentro de la app ----------
  // No se guardan en ningun lado: se arman en el momento mirando las solicitudes

  async avisos(usuario: UsuarioActivoInterface) {
    const esCliente = usuario.rol === Rol.CLIENTE;
    const solicitudes = await this.solicitudDeServicioRepository.find({
      where: esCliente ? { cliente: { idUsuario: usuario.sub } } : { profesional: { idUsuario: usuario.sub } },
      relations: { cliente: true, profesional: true, tarjeta: true },
    });

    const avisos: { idSolicitud: number; mensaje: string }[] = [];
    for (const solicitud of solicitudes) {
      await this.revisarVencimiento(solicitud);
      const mensaje = esCliente ? this.avisoParaCliente(solicitud) : this.avisoParaProfesional(solicitud);
      if (mensaje) {
        avisos.push({ idSolicitud: solicitud.idSolicitud, mensaje });
      }
    }
    return avisos;
  }

  private avisoParaProfesional(solicitud: SolicitudDeServicio) {
    const cliente = solicitud.cliente.nombre;
    const horasQueQuedan = Math.floor(48 - (Date.now() - solicitud.fechaCambioEstado.getTime()) / (1000 * 60 * 60));

    if (solicitud.estadoServicio === EstadoSolicitud.SOLICITADO) {
      return `Tenes una solicitud nueva de ${cliente}. Te quedan ${horasQueQuedan} hs para responder`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.EN_COORDINACION) {
      return `Acordate de cargar la fecha de la solicitud de ${cliente}. Te quedan ${horasQueQuedan} hs antes de que venza`;
    }
    const proxima = this.proximaFechaEn24hs(solicitud);
    if (proxima) {
      return `Tenes ${proxima.que} con ${cliente} el ${proxima.cuando}`;
    }
    return null;
  }

  private avisoParaCliente(solicitud: SolicitudDeServicio) {
    const profesional = solicitud.profesional.nombre;

    if (solicitud.estadoServicio === EstadoSolicitud.PRESUPUESTADO) {
      return `${profesional} te mando un presupuesto de $${solicitud.costoFinal}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      const proxima = this.proximaFechaEn24hs(solicitud);
      if (proxima) {
        return `Tenes ${proxima.que} con ${profesional} el ${proxima.cuando}`;
      }
      if (solicitud.costoEstimado != null && solicitud.fechaInicio <= new Date()) {
        return `Cuando ${profesional} termine el trabajo, ya podes pagar $${solicitud.costoFinal}`;
      }
    }
    if (solicitud.estadoServicio === EstadoSolicitud.RECHAZADO && solicitud.costoFinal && !solicitud.fechaInicio && !solicitud.tarjeta) {
      return `Tenes que pagar la visita de ${profesional}: $${solicitud.costoFinal}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.FINALIZADO && solicitud.calificacionServicio == null) {
      return `¿Como te fue con ${profesional}? Calificalo`;
    }
    return null;
  }

  // Si esta agendado y la visita (o el trabajo) es dentro de las proximas 24 hs
  private proximaFechaEn24hs(solicitud: SolicitudDeServicio) {
    if (solicitud.estadoServicio !== EstadoSolicitud.AGENDADO) {
      return null;
    }
    const esLaVisita = solicitud.costoEstimado == null;
    const fecha = esLaVisita ? solicitud.fechaVisita : solicitud.fechaInicio;
    const horasQueFaltan = (fecha.getTime() - Date.now()) / (1000 * 60 * 60);
    if (horasQueFaltan < 0 || horasQueFaltan > 24) {
      return null;
    }
    const cuando = fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return { que: esLaVisita ? 'una visita' : 'el trabajo', cuando };
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