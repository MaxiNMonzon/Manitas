import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { CreateUrgenteDto } from './dto/create-urgente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Not, Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { Tarjeta } from '../tarjeta/entities/tarjeta.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { PagarDto } from './dto/pagar.dto';
import { mejorPromocionVigente } from '../promocion/mejor-promocion';
import { CalificarDto } from './dto/calificar.dto';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Rol } from '../common/enums/rol.enum';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { AgendarDto } from './dto/agendar.dto';
import { AceptarDto } from './dto/aceptar.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';
import { AgendaQueryDto } from './dto/agenda-query.dto';

// Si al agendar no se dice cuanto dura, se toma una hora
const DURACION_POR_DEFECTO_MIN = 60;
const UN_MINUTO = 60 * 1000;

type TipoEvento = 'visita' | 'trabajo';

// El deposito al profesional se simula: llega a los 3 dias habiles del pago
const DIAS_HABILES_DEPOSITO = 3;

// Un cobro del profesional: un trabajo, o una visita que el cliente paga al rechazar el presupuesto.
// pendiente_cobro: el cliente todavia no pago, o pago y falta que se deposite; cobrado: ya depositado
export interface Cobro {
  idSolicitud: number;
  concepto: TipoEvento;
  estado: 'pendiente_cobro' | 'cobrado';
  monto: number;
  fechaPago: Date | null;
  depositoEstimado: Date | null;
  // Solo el tipo (ej: "Visa credito Banco Nacion"), nunca los digitos de la tarjeta del cliente
  medioDePago: string | null;
  especialidad: string | null;
  descripcionProblema: string;
  cliente: { nombre: string; apellido: string };
  // Cuando fue el trabajo (o la visita): para los que todavia esperan el pago
  fechaServicio: Date | null;
}

// Una visita o un trabajo en el calendario
export interface EventoAgenda {
  idSolicitud: number;
  tipo: TipoEvento;
  inicio: Date;
  fin: Date;
  estado: EstadoSolicitud;
  urgente: boolean;
  especialidad: string | null;
  descripcionProblema: string;
  // La otra persona: al profesional le muestra el cliente y al cliente, el profesional
  con: { nombre: string; apellido: string; telefono: string } | null;
  // La direccion solo se le muestra al profesional (es el que tiene que ir)
  direccion: string | null;
  zona: string | null;
}

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

    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
  ) {}

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, idCliente: number) {
    const cliente = await this.clienteRepository.findOneBy({
      idUsuario: idCliente,
    });

    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: createSolicitudDeServicioDto.idProfesional },
      relations: { especialidades: true },
    });

    if (!profesional) {
      throw new BadRequestException('El profesional indicado no existe');
    }

    const especialidad = await this.especialidadRepository.findOneBy({
      idEspecialidad: createSolicitudDeServicioDto.idEspecialidad,
    });

    if (!especialidad) {
      throw new BadRequestException('La especialidad indicada no existe');
    }

    // Regla: no se le puede pedir a un profesional algo que no hace
    const laHace = profesional.especialidades.some((e) => e.idEspecialidad === especialidad.idEspecialidad);
    if (!laHace) {
      throw new BadRequestException('Ese profesional no hace esa especialidad');
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
      especialidad,
    });
  }

  // ---------- Servicio urgente ----------

  // El cliente no elige profesional: se la muestra a todos los de esa especialidad en su zona
  async crearUrgente(createUrgenteDto: CreateUrgenteDto, idCliente: number) {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: idCliente });
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const especialidad = await this.especialidadRepository.findOneBy({
      idEspecialidad: createUrgenteDto.idEspecialidad,
    });
    if (!especialidad) {
      throw new BadRequestException('La especialidad indicada no existe');
    }

    return await this.solicitudDeServicioRepository.save({
      descripcionProblema: createUrgenteDto.descripcionProblema,
      urgente: true,
      estadoServicio: EstadoSolicitud.SOLICITADO,
      fechaCambioEstado: new Date(),
      cliente,
      especialidad,
    });
  }

  // Las urgentes que todavia nadie tomo, de las especialidades del profesional y en sus zonas
  async urgentesDisponibles(usuario: UsuarioActivoInterface) {
    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: usuario.sub },
      relations: { especialidades: true, zonasDeCobertura: true },
    });
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const idsEspecialidades = profesional.especialidades.map((e) => e.idEspecialidad);
    const idsZonas = profesional.zonasDeCobertura.map((z) => z.idZona);
    if (idsEspecialidades.length === 0 || idsZonas.length === 0) {
      return [];
    }

    const urgentes = await this.solicitudDeServicioRepository.find({
      where: {
        urgente: true,
        estadoServicio: EstadoSolicitud.SOLICITADO,
        profesional: IsNull(),
        especialidad: { idEspecialidad: In(idsEspecialidades) },
        cliente: { zonaResidencia: { idZona: In(idsZonas) } },
      },
      relations: { especialidad: true, cliente: { zonaResidencia: true } },
      order: { fechaSolicitud: 'ASC' },
    });

    // Se sacan las que ya vencieron (pasó la hora)
    const disponibles: SolicitudDeServicio[] = [];
    for (const solicitud of urgentes) {
      await this.revisarVencimiento(solicitud);
      if (solicitud.estadoServicio === EstadoSolicitud.SOLICITADO) {
        disponibles.push(solicitud);
      }
    }

    // Del cliente solo el nombre y la zona: la direccion y el telefono los ve el que la acepta
    return disponibles.map((solicitud) => ({
      idSolicitud: solicitud.idSolicitud,
      especialidad: solicitud.especialidad.nombreEspecialidad,
      descripcionProblema: solicitud.descripcionProblema,
      zona: solicitud.cliente.zonaResidencia.nombreZona,
      cliente: solicitud.cliente.nombre,
      minutosQueQuedan: this.minutosQueQuedan(solicitud),
    }));
  }

  async findAll(usuario: UsuarioActivoInterface) {
    let solicitudes: SolicitudDeServicio[];
    if (usuario.rol === Rol.CLIENTE) {
      solicitudes = await this.solicitudDeServicioRepository.find({
        where: { cliente: { idUsuario: usuario.sub } },
        // Con la otra persona, para poder mostrar "con quien" en las listas del front
        relations: { especialidad: true, profesional: true },
      });
    } else {
      solicitudes = await this.solicitudDeServicioRepository.find({
        where: { profesional: { idUsuario: usuario.sub } },
        relations: { especialidad: true, cliente: { zonaResidencia: true } },
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
      relations: { cliente: true, profesional: true, especialidad: true, tarjeta: { metodoDePago: true } },
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

  async aceptar(id: number, aceptarDto: AceptarDto, usuario: UsuarioActivoInterface) {
    // Una urgente que nadie tomo todavia la puede aceptar cualquier profesional de esa especialidad y zona
    const urgente = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud: id, urgente: true, profesional: IsNull() },
      relations: { especialidad: true, cliente: { zonaResidencia: true } },
    });
    if (urgente) {
      return await this.tomarUrgente(urgente, aceptarDto, usuario);
    }

    // Si era urgente y ya la tomo otro, se avisa claro en vez de "no participas"
    const yaTomada = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud: id, urgente: true },
      relations: { profesional: true },
    });
    if (yaTomada && yaTomada.profesional.idUsuario !== usuario.sub) {
      throw new BadRequestException('Otro profesional ya tomo esta urgente');
    }

    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    return await this.cambiarEstado(solicitud, EstadoSolicitud.EN_COORDINACION);
  }

  // Una urgente no se agenda (es en el dia): al aceptarla, el profesional dice en cuanto llega
  // y queda agendada directo, con la visita a esa hora
  private async tomarUrgente(solicitud: SolicitudDeServicio, aceptarDto: AceptarDto, usuario: UsuarioActivoInterface) {
    await this.revisarVencimiento(solicitud);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    if (!aceptarDto.minutosLlegada) {
      throw new BadRequestException('En una urgente tenes que indicar en cuantos minutos llegas (minutosLlegada)');
    }

    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: usuario.sub },
      relations: { especialidades: true, zonasDeCobertura: true },
    });
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }
    const haceLaEspecialidad = profesional.especialidades.some((e) => e.idEspecialidad === solicitud.especialidad.idEspecialidad);
    const cubreLaZona = profesional.zonasDeCobertura.some((z) => z.idZona === solicitud.cliente.zonaResidencia.idZona);
    if (!haceLaEspecialidad || !cubreLaZona) {
      throw new ForbiddenException('Esta urgente no es de tu especialidad o de tu zona');
    }

    const ahora = new Date();
    ahora.setMilliseconds(0); // MySQL redondea los milisegundos
    const llegada = new Date(ahora.getTime() + aceptarDto.minutosLlegada * UN_MINUTO);

    // Se asigna solo si sigue sin profesional: si dos aceptan a la vez, gana el primero
    const resultado = await this.solicitudDeServicioRepository
      .createQueryBuilder()
      .update(SolicitudDeServicio)
      .set({
        profesional: { idUsuario: profesional.idUsuario },
        estadoServicio: EstadoSolicitud.AGENDADO,
        fechaCambioEstado: ahora,
        costoVisita: profesional.costoVisita,
        fechaVisita: llegada,
        duracionEstimada: DURACION_POR_DEFECTO_MIN,
        fechaFinEstimada: new Date(llegada.getTime() + DURACION_POR_DEFECTO_MIN * UN_MINUTO),
      })
      .where('idSolicitud = :id', { id: solicitud.idSolicitud })
      .andWhere('profesionalIdUsuario IS NULL')
      .andWhere('estadoServicio = :estado', { estado: EstadoSolicitud.SOLICITADO })
      .execute();

    if (resultado.affected === 0) {
      throw new BadRequestException('Otro profesional ya tomo esta urgente');
    }
    return await this.findOne(solicitud.idSolicitud, usuario);
  }

  async rechazar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    return await this.cambiarEstado(solicitud, EstadoSolicitud.RECHAZADO);
  }

  async agendar(id: number, agendarDto: AgendarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.EN_COORDINACION]);
    // La visita de una urgente no se agenda: es en el dia, con el tiempo de llegada que se dio al aceptar
    // (el trabajo grande que sale despues del presupuesto si se puede agendar)
    if (solicitud.urgente && solicitud.costoEstimado == null) {
      throw new BadRequestException('Una urgente no se agenda: la visita es en el dia, con el tiempo de llegada que diste al aceptarla');
    }

    const fecha = new Date(agendarDto.fecha);
    if (fecha <= new Date()) {
      throw new BadRequestException('La fecha tiene que ser en el futuro');
    }

    // Cuanto dura: con eso se arma el calendario y se controla que no se pise con otra
    const duracion = agendarDto.duracionEstimada ?? DURACION_POR_DEFECTO_MIN;
    const fin = new Date(fecha.getTime() + duracion * UN_MINUTO);
    await this.validarQueNoSePise(solicitud, fecha, fin);

    // Si todavia no hay presupuesto aceptado es la visita, si ya hay es el trabajo
    if (solicitud.costoEstimado == null) {
      solicitud.fechaVisita = fecha;
    } else {
      solicitud.fechaInicio = fecha;
    }
    solicitud.duracionEstimada = duracion;
    solicitud.fechaFinEstimada = fin;
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
    solicitud.fechaPago = new Date();
    solicitud.fechaPago.setMilliseconds(0); // MySQL redondea los milisegundos
    let guardada: SolicitudDeServicio;
    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      solicitud.fechaFinReal = new Date();
      guardada = await this.cambiarEstado(solicitud, EstadoSolicitud.FINALIZADO);
    } else {
      guardada = await this.solicitudDeServicioRepository.save(solicitud);
    }

    // Solo se informa: el reintegro (y su tope, que esta en la descripcion de la promo) lo hace el banco
    let reintegro: object | null = null;
    if (mejorPromocion) {
      const dondeSeVe = tarjeta.metodoDePago.tipo.toLowerCase().includes('crédito')
        ? 'en el resumen de tu tarjeta'
        : 'en tu cuenta';
      reintegro = {
        promocion: mejorPromocion.descripcion,
        porcentaje: Number(mejorPromocion.porcentajeDescuento),
        mensaje: `${mejorPromocion.descripcion}. Te lo devuelve el banco ${dondeSeVe}`,
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
      relations: { cliente: true, profesional: true, especialidad: true, tarjeta: true },
    });

    const avisos: { idSolicitud: number; mensaje: string }[] = [];

    // Al profesional, primero las urgentes cerca que todavia nadie tomo
    if (usuario.rol === Rol.PROFESIONAL) {
      for (const urgente of await this.urgentesDisponibles(usuario)) {
        avisos.push({
          idSolicitud: urgente.idSolicitud,
          mensaje: `URGENTE de ${urgente.especialidad} en ${urgente.zona}: ${urgente.descripcionProblema}. Quedan ${urgente.minutosQueQuedan} minutos`,
        });
      }
    }

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
    const llegada = this.llegadaUrgente(solicitud);
    if (llegada) {
      return `URGENTE: tenes que llegar a lo de ${cliente} a las ${llegada.hora}`;
    }
    const proxima = this.proximaFechaEn24hs(solicitud);
    if (proxima) {
      return `Tenes ${proxima.que} con ${cliente} el ${proxima.cuando}`;
    }
    return null;
  }

  private avisoParaCliente(solicitud: SolicitudDeServicio) {
    // Urgente que todavia nadie acepto
    if (!solicitud.profesional) {
      if (solicitud.urgente && solicitud.estadoServicio === EstadoSolicitud.SOLICITADO) {
        return `Buscando un profesional para tu urgencia. Quedan ${this.minutosQueQuedan(solicitud)} minutos`;
      }
      return null;
    }
    const profesional = solicitud.profesional.nombre;

    if (solicitud.estadoServicio === EstadoSolicitud.PRESUPUESTADO) {
      return `${profesional} te mando un presupuesto de $${solicitud.costoFinal}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      const llegada = this.llegadaUrgente(solicitud);
      if (llegada) {
        return llegada.minutos > 0
          ? `${profesional} acepto tu urgencia y va en camino: llega a las ${llegada.hora} (en ${llegada.minutos} minutos)`
          : `${profesional} acepto tu urgencia y ya deberia estar llegando`;
      }
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

  // La visita de una urgente aceptada: a que hora llega el profesional y cuanto falta.
  // Se avisa hasta una hora despues de la hora de llegada
  private llegadaUrgente(solicitud: SolicitudDeServicio) {
    if (!solicitud.urgente || solicitud.estadoServicio !== EstadoSolicitud.AGENDADO || solicitud.costoEstimado != null || !solicitud.fechaVisita) {
      return null;
    }
    const minutos = Math.ceil((solicitud.fechaVisita.getTime() - Date.now()) / UN_MINUTO);
    if (minutos < -60) {
      return null;
    }
    const hora = solicitud.fechaVisita.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return { hora, minutos: Math.max(0, minutos) };
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

  // ---------- Cobros del profesional ----------

  // Todo lo que cobro o tiene para cobrar: trabajos y visitas pagadas, y lo que el cliente todavia no pago.
  // Ordenado de lo mas nuevo a lo mas viejo. Tambien los ultimos 4 numeros del CBU/CVU donde se deposita
  async cobros(usuario: UsuarioActivoInterface) {
    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: usuario.sub });
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }
    const solicitudes = await this.solicitudDeServicioRepository.find({
      where: {
        profesional: { idUsuario: usuario.sub },
        estadoServicio: In([EstadoSolicitud.AGENDADO, EstadoSolicitud.FINALIZADO, EstadoSolicitud.RECHAZADO]),
      },
      relations: { cliente: true, especialidad: true, tarjeta: { metodoDePago: true } },
    });

    const ahora = new Date();
    const cobros: Cobro[] = [];
    for (const solicitud of solicitudes) {
      const pagada = solicitud.tarjeta != null;
      // Que se cobra: el trabajo con presupuesto aceptado, o la visita de un presupuesto rechazado
      const esTrabajo = solicitud.costoEstimado != null && solicitud.estadoServicio !== EstadoSolicitud.RECHAZADO;
      const esVisita = solicitud.estadoServicio === EstadoSolicitud.RECHAZADO && !!solicitud.costoFinal && !solicitud.fechaInicio;
      if (!esTrabajo && !esVisita) {
        continue;
      }
      // Pagadas antes de que existiera fechaPago: se usa la fecha en que termino
      const fechaPago = pagada ? (solicitud.fechaPago ?? solicitud.fechaFinReal ?? solicitud.fechaCambioEstado) : null;
      const depositoEstimado = fechaPago ? this.sumarDiasHabiles(fechaPago, DIAS_HABILES_DEPOSITO) : null;
      cobros.push({
        idSolicitud: solicitud.idSolicitud,
        concepto: esTrabajo ? 'trabajo' : 'visita',
        estado: depositoEstimado && depositoEstimado <= ahora ? 'cobrado' : 'pendiente_cobro',
        monto: Number(solicitud.costoFinal ?? solicitud.costoEstimado ?? 0),
        fechaPago,
        depositoEstimado,
        medioDePago: solicitud.tarjeta?.metodoDePago?.tipo ?? null,
        especialidad: solicitud.especialidad?.nombreEspecialidad ?? null,
        descripcionProblema: solicitud.descripcionProblema,
        // El cliente puede haberse dado de baja
        cliente: { nombre: solicitud.cliente?.nombre ?? 'Cliente', apellido: solicitud.cliente?.apellido ?? '' },
        fechaServicio: esTrabajo ? (solicitud.fechaInicio ?? solicitud.fechaVisita) : solicitud.fechaVisita,
      });
    }

    const orden = (c: Cobro) => (c.fechaPago ?? c.fechaServicio ?? ahora).getTime();
    return {
      cuentaDeposito: profesional.cbu ? profesional.cbu.slice(-4) : null,
      cobros: cobros.sort((a, b) => orden(b) - orden(a)),
    };
  }

  // Suma dias de lunes a viernes (los feriados no se tienen en cuenta)
  private sumarDiasHabiles(desde: Date, dias: number): Date {
    const fecha = new Date(desde);
    let sumados = 0;
    while (sumados < dias) {
      fecha.setDate(fecha.getDate() + 1);
      const diaSemana = fecha.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        sumados++;
      }
    }
    return fecha;
  }

  // ---------- Agenda (calendario) ----------

  // Las visitas y trabajos del profesional o del cliente entre dos dias (incluidos)
  async agenda(query: AgendaQueryDto, usuario: UsuarioActivoInterface): Promise<EventoAgenda[]> {
    // En hora local: new Date('2026-10-01') seria medianoche UTC (el dia anterior aca)
    const desde = this.fechaLocal(query.desde);
    const hasta = this.fechaLocal(query.hasta);
    hasta.setDate(hasta.getDate() + 1); // hasta el final del ultimo dia
    if (hasta <= desde) {
      throw new BadRequestException('"hasta" no puede ser anterior a "desde"');
    }
    if (hasta.getTime() - desde.getTime() > 93 * 24 * 60 * UN_MINUTO) {
      throw new BadRequestException('Se pueden pedir hasta 3 meses juntos');
    }

    const esCliente = usuario.rol === Rol.CLIENTE;
    const mias = esCliente ? { cliente: { idUsuario: usuario.sub } } : { profesional: { idUsuario: usuario.sub } };
    const enElRango = Between(desde, new Date(hasta.getTime() - 1));
    const solicitudes = await this.solicitudDeServicioRepository.find({
      where: [
        { ...mias, fechaVisita: enElRango },
        { ...mias, fechaInicio: enElRango },
      ],
      relations: { cliente: { zonaResidencia: true }, profesional: true, especialidad: true },
    });

    const eventos: EventoAgenda[] = [];
    for (const solicitud of solicitudes) {
      const cliente = solicitud.cliente;
      const otro = esCliente ? solicitud.profesional : cliente;
      for (const { tipo, inicio, fin } of this.fechasEnAgenda(solicitud)) {
        if (inicio < desde || inicio >= hasta) {
          continue;
        }
        eventos.push({
          idSolicitud: solicitud.idSolicitud,
          tipo,
          inicio,
          fin,
          estado: solicitud.estadoServicio,
          urgente: solicitud.urgente,
          especialidad: solicitud.especialidad?.nombreEspecialidad ?? null,
          descripcionProblema: solicitud.descripcionProblema,
          con: otro ? { nombre: otro.nombre, apellido: otro.apellido, telefono: otro.telefono } : null,
          direccion: esCliente
            ? null
            : `${cliente.calle} ${cliente.altura}` + (cliente.piso ? `, piso ${cliente.piso}` : '') + (cliente.depto ? `, depto ${cliente.depto}` : ''),
          zona: cliente.zonaResidencia?.nombreZona ?? null,
        });
      }
    }
    return eventos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  // Que fechas de la solicitud van al calendario (puede tener la visita y el trabajo).
  // No van las canceladas/expiradas, ni la fecha vieja de algo que se esta reprogramando
  private fechasEnAgenda(solicitud: SolicitudDeServicio): { tipo: TipoEvento; inicio: Date; fin: Date }[] {
    const estado = solicitud.estadoServicio;
    if (estado === EstadoSolicitud.CANCELADO || estado === EstadoSolicitud.EXPIRADO) {
      return [];
    }
    const reprogramando = estado === EstadoSolicitud.EN_COORDINACION;
    const presupuestoAceptado = solicitud.costoEstimado != null;
    const fechas: { tipo: TipoEvento; inicio: Date; fin: Date }[] = [];

    // La visita: si se reprograma antes del presupuesto, su fecha vieja ya no vale
    if (solicitud.fechaVisita && !(reprogramando && !presupuestoAceptado)) {
      // fechaFinEstimada es de lo ultimo que se agendo: es de la visita solo mientras no hay presupuesto
      const finVisita = presupuestoAceptado ? null : solicitud.fechaFinEstimada;
      fechas.push({ tipo: 'visita', inicio: solicitud.fechaVisita, fin: this.finDe(solicitud.fechaVisita, finVisita) });
    }
    if (solicitud.fechaInicio && !reprogramando) {
      fechas.push({ tipo: 'trabajo', inicio: solicitud.fechaInicio, fin: this.finDe(solicitud.fechaInicio, solicitud.fechaFinEstimada) });
    }
    return fechas;
  }

  // Si no se sabe cuando termina (solicitudes viejas o trabajo chico hecho en la visita), una hora
  private finDe(inicio: Date, fechaFinEstimada: Date | null): Date {
    if (fechaFinEstimada && fechaFinEstimada > inicio) {
      return fechaFinEstimada;
    }
    return new Date(inicio.getTime() + DURACION_POR_DEFECTO_MIN * UN_MINUTO);
  }

  // Regla: el profesional no puede tener dos visitas o trabajos agendados que se superpongan
  private async validarQueNoSePise(solicitud: SolicitudDeServicio, inicio: Date, fin: Date) {
    const otras = await this.solicitudDeServicioRepository.find({
      where: {
        profesional: { idUsuario: solicitud.profesional.idUsuario },
        estadoServicio: EstadoSolicitud.AGENDADO,
        idSolicitud: Not(solicitud.idSolicitud),
      },
      relations: { cliente: true },
    });
    const hora = (fecha: Date) =>
      fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    for (const otra of otras) {
      for (const ocupado of this.fechasEnAgenda(otra)) {
        if (inicio < ocupado.fin && ocupado.inicio < fin) {
          const que = ocupado.tipo === 'visita' ? 'la visita' : 'el trabajo';
          throw new BadRequestException(
            `Se pisa con ${que} de ${otra.cliente.nombre} (${hora(ocupado.inicio)} a ${hora(ocupado.fin)})`,
          );
        }
      }
    }
  }

  // "2026-10-01" -> 1/10/2026 a las 00:00 en hora local
  private fechaLocal(texto: string): Date {
    const [anio, mes, dia] = texto.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
      throw new BadRequestException(`La fecha ${texto} no existe`);
    }
    return fecha;
  }

  // ---------- Pasos de los dos ----------

  async reprogramar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.AGENDADO]);
    // La visita de una urgente es en el dia: no se reprograma (no se puede volver a agendar)
    if (solicitud.urgente && solicitud.costoEstimado == null) {
      throw new BadRequestException('La visita de una urgente no se reprograma: es en el dia');
    }
    return await this.cambiarEstado(solicitud, EstadoSolicitud.EN_COORDINACION);
  }

  async cancelar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO, EstadoSolicitud.EN_COORDINACION, EstadoSolicitud.AGENDADO]);

    // Una urgente solo se cancela si nadie la acepto: despues el profesional ya va en camino
    if (solicitud.urgente && solicitud.estadoServicio !== EstadoSolicitud.SOLICITADO) {
      throw new BadRequestException('Una urgente solo se puede cancelar mientras nadie la haya aceptado');
    }

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

  // Si pasaron 48 hs sin respuesta (Solicitado) o sin fecha cargada (EnCoordinacion), vence.
  // Una urgente que nadie acepto vence en 1 hora
  private async revisarVencimiento(solicitud: SolicitudDeServicio) {
    const puedeVencer = solicitud.estadoServicio === EstadoSolicitud.SOLICITADO || solicitud.estadoServicio === EstadoSolicitud.EN_COORDINACION;
    const horasPasadas = (Date.now() - solicitud.fechaCambioEstado.getTime()) / (1000 * 60 * 60);
    const limite = solicitud.urgente && solicitud.estadoServicio === EstadoSolicitud.SOLICITADO ? 1 : 48;
    if (puedeVencer && horasPasadas >= limite) {
      solicitud.estadoServicio = EstadoSolicitud.EXPIRADO;
      await this.solicitudDeServicioRepository.save(solicitud);
    }
  }

  // Cuantos minutos le quedan a una urgente para que alguien la acepte
  private minutosQueQuedan(solicitud: SolicitudDeServicio) {
    return Math.max(0, Math.floor(60 - (Date.now() - solicitud.fechaCambioEstado.getTime()) / (1000 * 60)));
  }
}
