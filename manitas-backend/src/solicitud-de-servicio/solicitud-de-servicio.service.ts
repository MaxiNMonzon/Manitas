import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { CreateUrgenteDto } from './dto/create-urgente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { CalificarDto } from './dto/calificar.dto';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Rol } from '../common/enums/rol.enum';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { AceptarDto } from './dto/aceptar.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
import { ReprogramarDto } from './dto/reprogramar.dto';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';
import { AgendaQueryDto } from './dto/agenda-query.dto';
import { Franja, TurnoService } from '../turno/turno.service';
import { Turno } from '../turno/entities/turno.entity';

// Los turnos son de una hora
const DURACION_TURNO_MIN = 60;
const UN_MINUTO = 60 * 1000;
const UNA_HORA = 60 * UN_MINUTO;

// Plazos (en horas)
const HORAS_PARA_RESPONDER = 48; // el profesional, a una solicitud nueva
const HORAS_URGENTE = 1; // para que alguien tome una urgente
const HORAS_PROPUESTA = 24; // para contestar una reprogramacion
const HORAS_MINIMAS_PARA_REPROGRAMAR = 12; // antes del turno; despues solo se puede cancelar
const HORAS_ARREPENTIMIENTO = 6; // el cliente, para cancelar un trabajo ya contratado

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
  // Con que se pago (hoy solo "Mercado Pago")
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

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,

    private readonly turnoService: TurnoService,
  ) {}

  // ---------- Solicitar presupuesto (el cliente elige el turno de la visita) ----------

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, idCliente: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario: idCliente },
      relations: { zonaResidencia: true },
    });

    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: createSolicitudDeServicioDto.idProfesional },
      relations: { especialidades: true, zonasDeCobertura: true },
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

    // Regla: la visita es en la casa del cliente, asi que el profesional tiene que trabajar en su zona
    const vaASuZona = profesional.zonasDeCobertura.some((z) => z.idZona === cliente.zonaResidencia?.idZona);
    if (!vaASuZona) {
      throw new BadRequestException('Ese profesional no trabaja en tu zona');
    }

    // El turno tiene que ser uno libre del profesional
    const turno = await this.turnoService.validarLibre(profesional.idUsuario, createSolicitudDeServicioDto.inicioTurno);

    // La solicitud y la reserva del turno van juntas: si el turno lo toma otro justo antes, no se crea nada
    const { inicioTurno, ...datos } = createSolicitudDeServicioDto;
    const idSolicitud = await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      // El estado y las fechas los pone el sistema, no el cliente.
      // El costo de visita se copia para que no cambie si el profesional sube su tarifa despues
      const nueva = await manager.save(SolicitudDeServicio, {
        ...datos,
        estadoServicio: EstadoSolicitud.SOLICITADO,
        fechaCambioEstado: new Date(),
        costoVisita: profesional.costoVisita,
        fechaVisita: turno.inicio,
        duracionEstimada: DURACION_TURNO_MIN,
        cliente,
        profesional,
        especialidad,
      });
      await this.turnoService.reservar(manager, nueva.idSolicitud, profesional.idUsuario, [turno], 'visita', 'reservado');
      return nueva.idSolicitud;
    });
    return await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud },
      relations: { profesional: true, especialidad: true },
    });
  }

  // ---------- Servicio urgente ----------

  // El cliente no elige profesional ni turno: se la muestra a todos los de esa especialidad en su zona
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
      relations: { cliente: true, profesional: true, especialidad: true },
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

  // El detalle para mostrar: la solicitud con sus turnos tomados y, si hay una reprogramacion,
  // los propuestos. (Los turnos se agregan aparte para no guardarlos de nuevo al cambiar la solicitud)
  async detalle(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    return {
      ...solicitud,
      turnosReservados: await this.turnoService.turnosDe(id, 'reservado'),
      turnosPropuestos: await this.turnoService.turnosDe(id, 'propuesto'),
    };
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

  // Acepta la solicitud: la visita queda confirmada en el turno que eligio el cliente
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
    return await this.cambiarEstado(solicitud, EstadoSolicitud.AGENDADO);
  }

  // Una urgente no usa turnos (es para ahora): al aceptarla, el profesional dice en cuanto llega
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
        duracionEstimada: DURACION_TURNO_MIN,
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

  // No toma la solicitud: se libera el turno
  async rechazar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO]);
    return await this.cambiarEstadoLiberando(solicitud, EstadoSolicitud.RECHAZADO);
  }

  // Despues de la visita: el precio y cuantas horas lleva el trabajo.
  // Si ya estaba contratado, es un cambio de precio a mitad del trabajo (el cliente lo vuelve a aceptar)
  async presupuestar(id: number, presupuestarDto: PresupuestarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.AGENDADO, EstadoSolicitud.CONTRATADO]);

    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      if (solicitud.fechaVisita > new Date()) {
        throw new BadRequestException('Todavia no fue la visita: el presupuesto se pasa despues de ver el problema');
      }
      if (!presupuestarDto.horasTrabajo) {
        throw new BadRequestException('Indica cuantas horas lleva el trabajo (horasTrabajo)');
      }
      solicitud.costoEstimado = presupuestarDto.costo;
      solicitud.horasTrabajo = presupuestarDto.horasTrabajo;
    }
    // La primera vez el costoEstimado queda de registro; en un cambio de precio solo cambia el costoFinal
    solicitud.costoFinal = presupuestarDto.costo;
    return await this.cambiarEstado(solicitud, EstadoSolicitud.PRESUPUESTADO);
  }

  // ---------- Pasos del cliente ----------

  // Confirmar servicio: acepta el presupuesto y elige desde cuando arranca el trabajo
  // (o se hace en el momento, si entra en la hora de la visita)
  async aceptarPresupuesto(id: number, aceptarPresupuestoDto: AceptarPresupuestoDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.PRESUPUESTADO]);

    // Si el trabajo ya tenia horario (cambio de precio), vuelve a contratado con el mismo horario
    if (solicitud.fechaInicio) {
      return await this.cambiarEstado(solicitud, EstadoSolicitud.CONTRATADO);
    }

    const ahora = new Date();
    ahora.setMilliseconds(0); // MySQL redondea los milisegundos

    // Trabajo chico: se hace ahora, en la visita
    if (aceptarPresupuestoDto.enElMomento) {
      if (solicitud.horasTrabajo > 1) {
        throw new BadRequestException(
          `El trabajo lleva ${solicitud.horasTrabajo} horas: no entra en la visita, elegi desde cuando arranca (inicioTrabajo)`,
        );
      }
      solicitud.fechaInicio = ahora;
      solicitud.fechaFinEstimada = new Date(ahora.getTime() + UNA_HORA);
      solicitud.duracionEstimada = DURACION_TURNO_MIN;
      solicitud.fechaAceptacion = ahora;
      return await this.cambiarEstado(solicitud, EstadoSolicitud.CONTRATADO);
    }

    if (!aceptarPresupuestoDto.inicioTrabajo) {
      throw new BadRequestException('Elegi desde cuando arranca el trabajo (inicioTrabajo) o si se hace en el momento (enElMomento)');
    }

    // Las horas del trabajo, seguidas, dentro del horario del profesional
    const franjas = await this.turnoService.horasSeguidas(
      solicitud.profesional.idUsuario,
      aceptarPresupuestoDto.inicioTrabajo,
      solicitud.horasTrabajo,
    );
    solicitud.fechaInicio = franjas[0].inicio;
    solicitud.fechaFinEstimada = franjas[franjas.length - 1].fin;
    solicitud.duracionEstimada = solicitud.horasTrabajo * DURACION_TURNO_MIN;
    solicitud.fechaAceptacion = ahora;
    solicitud.estadoServicio = EstadoSolicitud.CONTRATADO;
    solicitud.fechaCambioEstado = new Date();

    await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      await this.turnoService.reservar(manager, solicitud.idSolicitud, solicitud.profesional.idUsuario, franjas, 'trabajo', 'reservado');
      await manager.save(solicitud);
    });
    return solicitud;
  }

  async rechazarPresupuesto(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarEstado(solicitud, [EstadoSolicitud.PRESUPUESTADO]);

    // Si rechaza despues de la visita, se cobra solo la visita (si el profesional la cobra)
    if (!solicitud.fechaInicio) {
      solicitud.costoFinal = solicitud.costoVisita;
    }
    // Si era un cambio de precio a mitad del trabajo, las horas que quedaban se liberan
    return await this.cambiarEstadoLiberando(solicitud, EstadoSolicitud.RECHAZADO, { tipo: 'trabajo' });
  }

  // Paga el trabajo (Contratado -> Finalizado) o solo la visita si rechazo el presupuesto (queda Rechazado).
  // Se cobra siempre el precio completo: el descuento de la promo lo reintegra el banco
  // Lo usa el pago con Mercado Pago: revisa que la solicitud se pueda pagar y devuelve cuanto hay que pagar
  async montoAPagar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    if (usuario.rol !== Rol.CLIENTE) {
      throw new ForbiddenException('Solo el cliente paga');
    }
    this.validarEstado(solicitud, [EstadoSolicitud.CONTRATADO, EstadoSolicitud.RECHAZADO]);

    if (this.estaPagada(solicitud)) {
      throw new BadRequestException('Esta solicitud ya fue pagada');
    }

    if (solicitud.estadoServicio === EstadoSolicitud.CONTRATADO && solicitud.fechaInicio > new Date()) {
      throw new BadRequestException('Todavia no llego la fecha del trabajo');
    }

    // En Rechazado solo se paga la visita (si el profesional la cobra)
    if (solicitud.estadoServicio === EstadoSolicitud.RECHAZADO && (!solicitud.costoFinal || solicitud.fechaInicio)) {
      throw new BadRequestException('No hay nada para pagar');
    }

    return { solicitud, monto: Number(solicitud.costoFinal) };
  }

  // Ya se pago: la fecha de pago se guarda al pagar (y las de prueba del seed ya la traen)
  private estaPagada(solicitud: SolicitudDeServicio) {
    return solicitud.fechaPago != null || solicitud.idPagoMercadoPago != null;
  }

  // Deja la solicitud pagada: el trabajo pasa a finalizado, la visita de un rechazado queda como esta
  private async marcarPagada(solicitud: SolicitudDeServicio) {
    solicitud.fechaPago = new Date();
    solicitud.fechaPago.setMilliseconds(0); // MySQL redondea los milisegundos
    if (solicitud.estadoServicio === EstadoSolicitud.CONTRATADO) {
      solicitud.fechaFinReal = new Date();
      return this.cambiarEstado(solicitud, EstadoSolicitud.FINALIZADO);
    }
    return this.solicitudDeServicioRepository.save(solicitud);
  }

  // Lo llama PaymentsService cuando Mercado Pago confirma que el pago se aprobo
  async registrarPagoMercadoPago(solicitud: SolicitudDeServicio, idPago: string) {
    solicitud.idPagoMercadoPago = idPago;
    return this.marcarPagada(solicitud);
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

  // ---------- Reprogramacion (los dos) ----------

  // Propone otro horario (uno de los turnos libres del profesional). El turno nuevo queda bloqueado
  // y el original sigue reservado hasta que el otro acepte. Tambien sirve para contestar una
  // propuesta con otra (contrapropuesta): ida y vuelta hasta que alguno acepte
  async reprogramar(id: number, reprogramarDto: ReprogramarDto, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    const quien = this.quienSoy(usuario);

    if (solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION) {
      // Contrapropuesta: solo la puede hacer el que tenia que contestar
      if (solicitud.propuestaDe === quien) {
        throw new BadRequestException('Ya propusiste un horario: tenes que esperar que el otro conteste');
      }
    } else {
      this.validarEstado(solicitud, [EstadoSolicitud.SOLICITADO, EstadoSolicitud.AGENDADO, EstadoSolicitud.CONTRATADO]);
      // A una solicitud nueva, el profesional puede contestarle con otro horario (el cliente, si quiere otro, cancela y pide de nuevo)
      if (solicitud.estadoServicio === EstadoSolicitud.SOLICITADO && quien !== 'profesional') {
        throw new BadRequestException('Mientras el profesional no responde, si queres otro horario cancela y pedi de nuevo');
      }
      // La visita de una urgente es para ahora: no se reprograma
      if (solicitud.urgente && solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
        throw new BadRequestException('La visita de una urgente no se reprograma: es para ahora');
      }
      // Hasta 12 hs antes del turno; despues solo se puede cancelar
      if (solicitud.estadoServicio !== EstadoSolicitud.SOLICITADO) {
        const actual = solicitud.estadoServicio === EstadoSolicitud.CONTRATADO ? solicitud.fechaInicio : solicitud.fechaVisita;
        if (actual.getTime() - Date.now() < HORAS_MINIMAS_PARA_REPROGRAMAR * UNA_HORA) {
          throw new BadRequestException(`Solo se puede reprogramar hasta ${HORAS_MINIMAS_PARA_REPROGRAMAR} hs antes; ahora solo se puede cancelar`);
        }
      }
    }

    const estadoBase = solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION ? solicitud.estadoAnterior! : solicitud.estadoServicio;
    const tipo: TipoEvento = estadoBase === EstadoSolicitud.CONTRATADO ? 'trabajo' : 'visita';
    const franjas = await this.franjasNuevas(solicitud, tipo, reprogramarDto.inicio);

    await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      // Si habia una propuesta anterior, se reemplaza (su turno se libera)
      await this.turnoService.liberar(manager, solicitud.idSolicitud, { estado: 'propuesto' });
      await this.turnoService.reservar(manager, solicitud.idSolicitud, solicitud.profesional.idUsuario, franjas, tipo, 'propuesto');
      solicitud.estadoAnterior = estadoBase;
      solicitud.propuestaDe = quien;
      solicitud.estadoServicio = EstadoSolicitud.REPROGRAMACION;
      solicitud.fechaCambioEstado = new Date();
      await manager.save(solicitud);
    });
    return await this.detalle(id, usuario);
  }

  // Acepta el horario propuesto: queda el nuevo y se libera el viejo
  async aceptarReprogramacion(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarQueLeTocaContestar(solicitud, usuario);

    const propuestos = await this.turnoService.turnosDe(id, 'propuesto');
    const tipo = propuestos[0].tipo;
    if (tipo === 'visita') {
      solicitud.fechaVisita = propuestos[0].inicio;
    } else {
      solicitud.fechaInicio = propuestos[0].inicio;
      solicitud.fechaFinEstimada = propuestos[propuestos.length - 1].fin;
    }
    // Si era una solicitud nueva, al ponerse de acuerdo en el horario la visita queda confirmada
    const nuevoEstado = solicitud.estadoAnterior === EstadoSolicitud.SOLICITADO ? EstadoSolicitud.AGENDADO : solicitud.estadoAnterior!;
    solicitud.estadoServicio = nuevoEstado;
    solicitud.estadoAnterior = null;
    solicitud.propuestaDe = null;
    solicitud.fechaCambioEstado = new Date();

    await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      await this.turnoService.liberar(manager, id, { tipo, estado: 'reservado' });
      await this.turnoService.confirmarPropuestos(manager, id);
      await manager.save(solicitud);
    });
    return await this.detalle(id, usuario);
  }

  // Rechaza el horario propuesto: queda el original, como si no se hubiera propuesto nada
  async rechazarReprogramacion(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    this.validarQueLeTocaContestar(solicitud, usuario);
    // Si el que propuso es el profesional, es porque no puede en el horario original: el cliente
    // no puede "quedarse con el suyo", tiene que aceptar, proponer otro horario o cancelar
    if (solicitud.propuestaDe === 'profesional') {
      throw new BadRequestException('El profesional no puede en tu horario: acepta el nuevo, propone otro o cancela');
    }
    await this.volverAlHorarioOriginal(solicitud);
    return await this.detalle(id, usuario);
  }

  // ---------- Cancelar (los dos) ----------

  // Solicitado: el cliente. Agendado (la visita): los dos, en cualquier momento (emergencias).
  // Contratado: el profesional siempre; el cliente solo dentro de las 6 hs de aceptar y antes de que arranque.
  // Presupuestado no: el que no quiere, rechaza. Una urgente solo mientras nadie la tomo
  async cancelar(id: number, usuario: UsuarioActivoInterface) {
    const solicitud = await this.findOne(id, usuario);
    const quien = this.quienSoy(usuario);
    // En una reprogramacion valen las reglas del estado en el que estaba
    const estado = solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION ? solicitud.estadoAnterior! : solicitud.estadoServicio;

    if (![EstadoSolicitud.SOLICITADO, EstadoSolicitud.AGENDADO, EstadoSolicitud.CONTRATADO].includes(estado)) {
      throw new BadRequestException(`No se puede cancelar con la solicitud en estado ${solicitud.estadoServicio}`);
    }

    if (solicitud.urgente && estado !== EstadoSolicitud.SOLICITADO) {
      throw new BadRequestException('Una urgente solo se puede cancelar mientras nadie la haya aceptado');
    }

    if (estado === EstadoSolicitud.SOLICITADO && quien === 'profesional') {
      throw new BadRequestException('Si no podes tomarla, rechazala (o propone otro horario)');
    }

    if (estado === EstadoSolicitud.CONTRATADO && quien === 'cliente') {
      const yaArranco = solicitud.fechaInicio <= new Date();
      const pasoElPlazo = Date.now() - solicitud.fechaAceptacion.getTime() > HORAS_ARREPENTIMIENTO * UNA_HORA;
      if (yaArranco || pasoElPlazo) {
        throw new BadRequestException(
          `El trabajo ya esta contratado: solo se podia cancelar dentro de las ${HORAS_ARREPENTIMIENTO} hs de aceptar el presupuesto y antes de que arranque`,
        );
      }
    }

    solicitud.estadoAnterior = null;
    solicitud.propuestaDe = null;
    return await this.cambiarEstadoLiberando(solicitud, EstadoSolicitud.CANCELADO);
  }

  // ---------- Avisos dentro de la app ----------
  // No se guardan en ningun lado: se arman en el momento mirando las solicitudes

  async avisos(usuario: UsuarioActivoInterface) {
    const esCliente = usuario.rol === Rol.CLIENTE;
    const solicitudes = await this.solicitudDeServicioRepository.find({
      where: esCliente ? { cliente: { idUsuario: usuario.sub } } : { profesional: { idUsuario: usuario.sub } },
      relations: { cliente: true, profesional: true, especialidad: true },
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
      const mensaje = esCliente ? await this.avisoParaCliente(solicitud) : await this.avisoParaProfesional(solicitud);
      if (mensaje) {
        avisos.push({ idSolicitud: solicitud.idSolicitud, mensaje });
      }
    }
    return avisos;
  }

  private async avisoParaProfesional(solicitud: SolicitudDeServicio) {
    const cliente = solicitud.cliente.nombre;

    if (solicitud.estadoServicio === EstadoSolicitud.SOLICITADO) {
      const horasQueQuedan = Math.max(0, Math.floor(HORAS_PARA_RESPONDER - (Date.now() - solicitud.fechaCambioEstado.getTime()) / UNA_HORA));
      return `Tenes una solicitud nueva de ${cliente} para el ${this.texto(solicitud.fechaVisita)}. Te quedan ${horasQueQuedan} hs para responder`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION) {
      return await this.avisoReprogramacion(solicitud, 'profesional', cliente);
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

  private async avisoParaCliente(solicitud: SolicitudDeServicio) {
    // Urgente que todavia nadie acepto
    if (!solicitud.profesional) {
      if (solicitud.urgente && solicitud.estadoServicio === EstadoSolicitud.SOLICITADO) {
        return `Buscando un profesional para tu urgencia. Quedan ${this.minutosQueQuedan(solicitud)} minutos`;
      }
      return null;
    }
    const profesional = solicitud.profesional.nombre;

    if (solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION) {
      return await this.avisoReprogramacion(solicitud, 'cliente', profesional);
    }
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
    }
    const proxima = this.proximaFechaEn24hs(solicitud);
    if (proxima) {
      return `Tenes ${proxima.que} con ${profesional} el ${proxima.cuando}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.CONTRATADO && solicitud.fechaInicio <= new Date()) {
      return `Cuando ${profesional} termine el trabajo, ya podes pagar $${solicitud.costoFinal}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.RECHAZADO && solicitud.costoFinal && !solicitud.fechaInicio && !this.estaPagada(solicitud)) {
      return `Tenes que pagar la visita de ${profesional}: $${solicitud.costoFinal}`;
    }
    if (solicitud.estadoServicio === EstadoSolicitud.FINALIZADO && solicitud.calificacionServicio == null) {
      return `¿Como te fue con ${profesional}? Calificalo`;
    }
    return null;
  }

  // Al que le toca contestar: "X te propone cambiar al ...". Al que propuso: que espera la respuesta
  private async avisoReprogramacion(solicitud: SolicitudDeServicio, yo: 'cliente' | 'profesional', otro: string) {
    const propuestos = await this.turnoService.turnosDe(solicitud.idSolicitud, 'propuesto');
    if (propuestos.length === 0) {
      return null;
    }
    const que = propuestos[0].tipo === 'visita' ? 'la visita' : 'el trabajo';
    const cuando = this.texto(propuestos[0].inicio);
    if (solicitud.propuestaDe === yo) {
      return `Le propusiste a ${otro} pasar ${que} al ${cuando}: esperando su respuesta`;
    }
    // Si el que propone es el profesional, el cliente no puede quedarse con el horario de antes
    if (yo === 'cliente') {
      return `${otro} te propone pasar ${que} al ${cuando}. Acepta o propone otro horario: si no contestas en 24 hs, se cancela`;
    }
    return `${otro} te propone pasar ${que} al ${cuando}. Acepta, propone otro horario o rechaza`;
  }

  // La visita de una urgente aceptada: a que hora llega el profesional y cuanto falta.
  // Se avisa hasta una hora despues de la hora de llegada
  private llegadaUrgente(solicitud: SolicitudDeServicio) {
    if (!solicitud.urgente || solicitud.estadoServicio !== EstadoSolicitud.AGENDADO || !solicitud.fechaVisita) {
      return null;
    }
    const minutos = Math.ceil((solicitud.fechaVisita.getTime() - Date.now()) / UN_MINUTO);
    if (minutos < -60) {
      return null;
    }
    const hora = solicitud.fechaVisita.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return { hora, minutos: Math.max(0, minutos) };
  }

  // La visita (Agendado) o el trabajo (Contratado), si es dentro de las proximas 24 hs
  private proximaFechaEn24hs(solicitud: SolicitudDeServicio) {
    let fecha: Date | null = null;
    let que = '';
    if (solicitud.estadoServicio === EstadoSolicitud.AGENDADO) {
      fecha = solicitud.fechaVisita;
      que = 'una visita';
    } else if (solicitud.estadoServicio === EstadoSolicitud.CONTRATADO) {
      fecha = solicitud.fechaInicio;
      que = 'el trabajo';
    }
    if (!fecha) {
      return null;
    }
    const horasQueFaltan = (fecha.getTime() - Date.now()) / UNA_HORA;
    if (horasQueFaltan < 0 || horasQueFaltan > 24) {
      return null;
    }
    return { que, cuando: this.texto(fecha) };
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
        estadoServicio: In([EstadoSolicitud.CONTRATADO, EstadoSolicitud.FINALIZADO, EstadoSolicitud.RECHAZADO]),
      },
      relations: { cliente: true, especialidad: true },
    });

    const ahora = new Date();
    const cobros: Cobro[] = [];
    for (const solicitud of solicitudes) {
      const pagada = this.estaPagada(solicitud);
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
        medioDePago: solicitud.idPagoMercadoPago ? 'Mercado Pago' : null,
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
    if (hasta.getTime() - desde.getTime() > 93 * 24 * UNA_HORA) {
      throw new BadRequestException('Se pueden pedir hasta 3 meses juntos');
    }

    const esCliente = usuario.rol === Rol.CLIENTE;
    const mias = esCliente ? { cliente: { idUsuario: usuario.sub } } : { profesional: { idUsuario: usuario.sub } };
    // Se traen las que tienen visita en el rango, o un trabajo que se cruza con el rango
    const solicitudes = await this.solicitudDeServicioRepository.find({
      where: [
        { ...mias, fechaVisita: Between(desde, new Date(hasta.getTime() - 1)) },
        { ...mias, fechaInicio: Between(new Date(desde.getTime() - 120 * 24 * UNA_HORA), new Date(hasta.getTime() - 1)) },
      ],
      relations: { cliente: { zonaResidencia: true }, profesional: true, especialidad: true },
    });

    const eventos: EventoAgenda[] = [];
    for (const solicitud of solicitudes) {
      const cliente = solicitud.cliente;
      const otro = esCliente ? solicitud.profesional : cliente;
      for (const { tipo, inicio, fin } of await this.fechasEnAgenda(solicitud)) {
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

  // Que va al calendario: la visita (una hora) y el trabajo. Un trabajo de varios dias se muestra
  // como un bloque por cada tramo seguido de turnos (ej: lunes 15 a 18 y martes 9 a 12).
  // En una reprogramacion se sigue mostrando el horario original (vale hasta que acepten el nuevo)
  private async fechasEnAgenda(solicitud: SolicitudDeServicio): Promise<{ tipo: TipoEvento; inicio: Date; fin: Date }[]> {
    const estado = solicitud.estadoServicio;
    if (estado === EstadoSolicitud.CANCELADO || estado === EstadoSolicitud.EXPIRADO) {
      return [];
    }
    const fechas: { tipo: TipoEvento; inicio: Date; fin: Date }[] = [];
    if (solicitud.fechaVisita) {
      fechas.push({ tipo: 'visita', inicio: solicitud.fechaVisita, fin: new Date(solicitud.fechaVisita.getTime() + UNA_HORA) });
    }
    if (solicitud.fechaInicio) {
      const turnosTrabajo = (await this.turnoService.turnosDe(solicitud.idSolicitud, 'reservado')).filter((t) => t.tipo === 'trabajo');
      if (turnosTrabajo.length === 0) {
        // Trabajo hecho en el momento de la visita (no usa turnos)
        const fin = solicitud.fechaFinEstimada ?? new Date(solicitud.fechaInicio.getTime() + UNA_HORA);
        fechas.push({ tipo: 'trabajo', inicio: solicitud.fechaInicio, fin });
      } else {
        for (const tramo of this.juntarSeguidos(turnosTrabajo)) {
          fechas.push({ tipo: 'trabajo', inicio: tramo.inicio, fin: tramo.fin });
        }
      }
    }
    return fechas;
  }

  // Junta turnos que van uno atras del otro (9-10, 10-11 -> 9-11)
  private juntarSeguidos(turnos: Turno[]): Franja[] {
    const tramos: Franja[] = [];
    for (const turno of turnos) {
      const ultimo = tramos[tramos.length - 1];
      if (ultimo && ultimo.fin.getTime() === turno.inicio.getTime()) {
        ultimo.fin = turno.fin;
      } else {
        tramos.push({ inicio: turno.inicio, fin: turno.fin });
      }
    }
    return tramos;
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

  // ---------- Ayudas ----------

  private quienSoy(usuario: UsuarioActivoInterface): 'cliente' | 'profesional' {
    return usuario.rol === Rol.CLIENTE ? 'cliente' : 'profesional';
  }

  private validarEstado(solicitud: SolicitudDeServicio, estadosPermitidos: EstadoSolicitud[]) {
    if (!estadosPermitidos.includes(solicitud.estadoServicio)) {
      throw new BadRequestException(`No se puede hacer esto con la solicitud en estado ${solicitud.estadoServicio}`);
    }
  }

  private validarQueLeTocaContestar(solicitud: SolicitudDeServicio, usuario: UsuarioActivoInterface) {
    this.validarEstado(solicitud, [EstadoSolicitud.REPROGRAMACION]);
    if (solicitud.propuestaDe === this.quienSoy(usuario)) {
      throw new BadRequestException('Este horario lo propusiste vos: tenes que esperar que el otro conteste');
    }
  }

  // Los turnos del horario nuevo: uno para la visita, o las horas seguidas del trabajo
  private async franjasNuevas(solicitud: SolicitudDeServicio, tipo: TipoEvento, inicio: string): Promise<Franja[]> {
    if (tipo === 'visita') {
      return [await this.turnoService.validarLibre(solicitud.profesional.idUsuario, inicio)];
    }
    return await this.turnoService.horasSeguidas(solicitud.profesional.idUsuario, inicio, solicitud.horasTrabajo);
  }

  private async cambiarEstado(solicitud: SolicitudDeServicio, nuevoEstado: EstadoSolicitud) {
    solicitud.estadoServicio = nuevoEstado;
    solicitud.fechaCambioEstado = new Date();
    return await this.solicitudDeServicioRepository.save(solicitud);
  }

  // Cambia de estado y libera turnos (todos, o los que diga el filtro), todo junto
  private async cambiarEstadoLiberando(
    solicitud: SolicitudDeServicio,
    nuevoEstado: EstadoSolicitud,
    filtro: { tipo?: TipoEvento } = {},
  ) {
    solicitud.estadoServicio = nuevoEstado;
    solicitud.fechaCambioEstado = new Date();
    return await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      await this.turnoService.liberar(manager, solicitud.idSolicitud, filtro);
      return await manager.save(solicitud);
    });
  }

  // Se descarta la propuesta: vuelve al estado y al horario que tenia
  private async volverAlHorarioOriginal(solicitud: SolicitudDeServicio) {
    solicitud.estadoServicio = solicitud.estadoAnterior!;
    solicitud.estadoAnterior = null;
    solicitud.propuestaDe = null;
    solicitud.fechaCambioEstado = new Date();
    await this.solicitudDeServicioRepository.manager.transaction(async (manager) => {
      await this.turnoService.liberar(manager, solicitud.idSolicitud, { estado: 'propuesto' });
      await manager.save(solicitud);
    });
  }

  // Los vencimientos se revisan cada vez que alguien mira la solicitud (no hay un proceso aparte):
  // - una propuesta de horario sin contestar en 24 hs (o que ya llego): si la hizo el cliente, se da por
  //   rechazada (sigue el horario de antes); si la hizo el profesional, se cancela (el no puede en el de antes)
  // - una solicitud nueva sin respuesta en 48 hs, o cuando ya llego el turno elegido, vence
  // - una urgente que nadie tomo en 1 hora, vence
  private async revisarVencimiento(solicitud: SolicitudDeServicio) {
    if (solicitud.estadoServicio === EstadoSolicitud.REPROGRAMACION) {
      const propuestos = await this.turnoService.turnosDe(solicitud.idSolicitud, 'propuesto');
      const pasoElPlazo = Date.now() - solicitud.fechaCambioEstado.getTime() >= HORAS_PROPUESTA * UNA_HORA;
      const yaLlego = propuestos.length === 0 || propuestos[0].inicio <= new Date();
      if (pasoElPlazo || yaLlego) {
        if (solicitud.propuestaDe === 'profesional') {
          solicitud.estadoAnterior = null;
          solicitud.propuestaDe = null;
          await this.cambiarEstadoLiberando(solicitud, EstadoSolicitud.CANCELADO);
        } else {
          await this.volverAlHorarioOriginal(solicitud);
        }
      }
    }

    if (solicitud.estadoServicio !== EstadoSolicitud.SOLICITADO) {
      return;
    }
    const horasPasadas = (Date.now() - solicitud.fechaCambioEstado.getTime()) / UNA_HORA;
    const vencio = solicitud.urgente
      ? horasPasadas >= HORAS_URGENTE
      : horasPasadas >= HORAS_PARA_RESPONDER || (solicitud.fechaVisita != null && solicitud.fechaVisita <= new Date());
    if (vencio) {
      await this.cambiarEstadoLiberando(solicitud, EstadoSolicitud.EXPIRADO);
    }
  }

  // Cuantos minutos le quedan a una urgente para que alguien la acepte
  private minutosQueQuedan(solicitud: SolicitudDeServicio) {
    return Math.max(0, Math.floor(HORAS_URGENTE * 60 - (Date.now() - solicitud.fechaCambioEstado.getTime()) / UN_MINUTO));
  }

  private texto(fecha: Date) {
    return fecha.toLocaleString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
