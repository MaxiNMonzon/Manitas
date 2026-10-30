import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Turno } from './entities/turno.entity';
import { HorarioLaboral } from './entities/horario-laboral.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { GuardarHorarioDto } from './dto/guardar-horario.dto';
import { TurnosLibresQueryDto } from './dto/turnos-libres-query.dto';

const UNA_HORA = 60 * 60 * 1000;
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// Un horario de una hora (lo que se muestra como turno libre o se reserva)
export interface Franja {
  inicio: Date;
  fin: Date;
}

@Injectable()
export class TurnoService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,

    @InjectRepository(HorarioLaboral)
    private readonly horarioRepository: Repository<HorarioLaboral>,

    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,

    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepository: Repository<SolicitudDeServicio>,
  ) {}

  // ---------- Horario fijo del profesional ----------

  // Reemplaza todo el horario (se carga una sola vez y queda fijo hasta que lo cambie)
  async guardarHorario(idProfesional: number, dto: GuardarHorarioDto) {
    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: idProfesional });
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    for (const h of dto.horarios) {
      if (h.horaDesde >= h.horaHasta) {
        throw new BadRequestException(`El ${DIAS[h.diaSemana]} la hora de inicio tiene que ser antes que la de fin`);
      }
    }
    // Dos rangos del mismo dia no se pueden pisar (ej: 9 a 13 y 12 a 18)
    for (let i = 0; i < dto.horarios.length; i++) {
      for (let j = i + 1; j < dto.horarios.length; j++) {
        const a = dto.horarios[i];
        const b = dto.horarios[j];
        if (a.diaSemana === b.diaSemana && a.horaDesde < b.horaHasta && b.horaDesde < a.horaHasta) {
          throw new BadRequestException(`El ${DIAS[a.diaSemana]} hay dos rangos que se pisan`);
        }
      }
    }

    await this.horarioRepository.manager.transaction(async (manager) => {
      await manager.delete(HorarioLaboral, { profesional: { idUsuario: idProfesional } });
      if (dto.horarios.length > 0) {
        await manager.insert(
          HorarioLaboral,
          dto.horarios.map((h) => ({ ...h, profesional: { idUsuario: idProfesional } })),
        );
      }
    });
    return await this.verHorario(idProfesional);
  }

  async verHorario(idProfesional: number) {
    const horarios = await this.horarioRepository.find({
      where: { profesional: { idUsuario: idProfesional } },
      order: { diaSemana: 'ASC', horaDesde: 'ASC' },
    });
    return horarios.map((h) => ({ ...h, dia: DIAS[h.diaSemana] }));
  }

  // ---------- Turnos libres ----------

  // Los turnos libres de un profesional entre dos dias: su horario fijo menos lo que ya esta tomado.
  // Solo los que todavia no empezaron
  async libres(idProfesional: number, query: TurnosLibresQueryDto): Promise<Franja[]> {
    const profesional = await this.profesionalRepository.findOneBy({ idUsuario: idProfesional });
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }
    const desde = this.fechaLocal(query.desde);
    const hasta = this.fechaLocal(query.hasta);
    hasta.setDate(hasta.getDate() + 1); // hasta el final del ultimo dia
    if (hasta <= desde) {
      throw new BadRequestException('"hasta" no puede ser anterior a "desde"');
    }
    if (hasta.getTime() - desde.getTime() > 92 * 24 * UNA_HORA) {
      throw new BadRequestException('Se pueden pedir hasta 3 meses juntos');
    }

    const horarios = await this.horariosDe(idProfesional);
    const estaTomado = await this.ocupacion(idProfesional, desde, hasta);
    const ahora = new Date();

    const libres: Franja[] = [];
    for (const dia = new Date(desde); dia < hasta; dia.setDate(dia.getDate() + 1)) {
      for (const h of horarios.filter((x) => x.diaSemana === dia.getDay())) {
        for (let hora = h.horaDesde; hora < h.horaHasta; hora++) {
          const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora);
          if (inicio > ahora && !estaTomado(inicio)) {
            libres.push({ inicio, fin: new Date(inicio.getTime() + UNA_HORA) });
          }
        }
      }
    }
    return libres.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  // ---------- Lo que usa la solicitud ----------

  // Controla que un horario sirva para reservar: en punto, en el futuro, dentro del horario
  // del profesional y libre. Devuelve la franja de una hora
  async validarLibre(idProfesional: number, textoInicio: string): Promise<Franja> {
    const inicio = this.leerInicio(textoInicio);
    const horarios = await this.horariosDe(idProfesional);
    if (!this.esHoraDeTrabajo(horarios, inicio)) {
      throw new BadRequestException('Ese horario no esta dentro del horario de trabajo del profesional');
    }
    const estaTomado = await this.ocupacion(idProfesional, inicio, new Date(inicio.getTime() + UNA_HORA));
    if (estaTomado(inicio)) {
      throw new ConflictException('Ese turno ya esta tomado, elegi otro');
    }
    return { inicio, fin: new Date(inicio.getTime() + UNA_HORA) };
  }

  // Para un trabajo de varias horas: desde el inicio elegido, las horas seguidas dentro del horario
  // del profesional (si no entran en un dia, sigue el proximo dia que trabaja).
  // Si alguna del medio esta tomada, ese inicio no sirve y se le dice cual es el proximo que si
  async horasSeguidas(idProfesional: number, textoInicio: string, horas: number): Promise<Franja[]> {
    const inicio = this.leerInicio(textoInicio);
    const horarios = await this.horariosDe(idProfesional);
    if (!this.esHoraDeTrabajo(horarios, inicio)) {
      throw new BadRequestException('Ese horario no esta dentro del horario de trabajo del profesional');
    }
    // Se mira hasta 120 dias para adelante (alcanza para cualquier obra)
    const estaTomado = await this.ocupacion(idProfesional, inicio, new Date(inicio.getTime() + 120 * 24 * UNA_HORA));

    const franjas = this.armarHorasSeguidas(horarios, estaTomado, inicio, horas);
    if (franjas) {
      return franjas;
    }

    // Ese inicio no sirve: se busca el proximo que si (hasta 60 dias)
    const limite = new Date(inicio.getTime() + 60 * 24 * UNA_HORA);
    for (let candidato = new Date(inicio.getTime() + UNA_HORA); candidato < limite; candidato = new Date(candidato.getTime() + UNA_HORA)) {
      if (this.esHoraDeTrabajo(horarios, candidato) && this.armarHorasSeguidas(horarios, estaTomado, candidato, horas)) {
        throw new ConflictException(
          `No entran ${horas} horas seguidas desde ese horario porque hay turnos tomados en el medio. El proximo inicio posible es el ${this.texto(candidato)}`,
        );
      }
    }
    throw new ConflictException(`No hay ${horas} horas seguidas libres en los proximos 60 dias desde ese horario`);
  }

  // Guarda los turnos tomados. Si otro los tomo justo antes (el indice unico salta), avisa
  async reservar(
    manager: EntityManager,
    idSolicitud: number,
    idProfesional: number,
    franjas: Franja[],
    tipo: 'visita' | 'trabajo',
    estado: 'reservado' | 'propuesto',
  ) {
    try {
      await manager.insert(
        Turno,
        franjas.map((f) => ({
          inicio: f.inicio,
          fin: f.fin,
          tipo,
          estado,
          profesional: { idUsuario: idProfesional },
          solicitud: { idSolicitud },
        })),
      );
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY' || (error as { driverError?: { code?: string } }).driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ese horario lo acaba de tomar otra persona, elegi otro');
      }
      throw error;
    }
  }

  // Libera turnos de una solicitud (se borran: el horario vuelve a quedar libre)
  async liberar(manager: EntityManager, idSolicitud: number, filtro: { tipo?: 'visita' | 'trabajo'; estado?: 'reservado' | 'propuesto' } = {}) {
    await manager.delete(Turno, { solicitud: { idSolicitud }, ...filtro });
  }

  // Los turnos propuestos pasan a ser los reservados (cuando se acepta una reprogramacion)
  async confirmarPropuestos(manager: EntityManager, idSolicitud: number) {
    await manager.update(Turno, { solicitud: { idSolicitud }, estado: 'propuesto' }, { estado: 'reservado' });
  }

  async turnosDe(idSolicitud: number, estado: 'reservado' | 'propuesto') {
    return await this.turnoRepository.find({
      where: { solicitud: { idSolicitud }, estado },
      order: { inicio: 'ASC' },
    });
  }

  // ---------- Ayudas ----------

  private async horariosDe(idProfesional: number) {
    return await this.horarioRepository.find({ where: { profesional: { idUsuario: idProfesional } } });
  }

  private esHoraDeTrabajo(horarios: HorarioLaboral[], inicio: Date) {
    const hora = inicio.getHours();
    return horarios.some((h) => h.diaSemana === inicio.getDay() && h.horaDesde <= hora && hora < h.horaHasta);
  }

  // Devuelve una funcion que dice si un horario de una hora esta ocupado: por un turno tomado
  // (reservado o propuesto) o por la visita de una urgente (que no usa turnos)
  private async ocupacion(idProfesional: number, desde: Date, hasta: Date) {
    const tomados = await this.turnoRepository.find({
      where: { profesional: { idUsuario: idProfesional }, inicio: MoreThanOrEqual(new Date(desde.getTime() - UNA_HORA)) },
    });
    const inicios = new Set(tomados.map((t) => t.inicio.getTime()));

    const urgentes = await this.solicitudRepository.find({
      where: {
        profesional: { idUsuario: idProfesional },
        urgente: true,
        estadoServicio: In([EstadoSolicitud.AGENDADO, EstadoSolicitud.PRESUPUESTADO]),
        fechaVisita: Between(new Date(desde.getTime() - UNA_HORA), hasta),
      },
    });

    return (inicio: Date) => {
      if (inicios.has(inicio.getTime())) {
        return true;
      }
      const fin = inicio.getTime() + UNA_HORA;
      return urgentes.some((u) => u.fechaVisita.getTime() < fin && inicio.getTime() < u.fechaVisita.getTime() + UNA_HORA);
    };
  }

  // Arma las horas seguidas desde un inicio, o null si alguna esta tomada
  private armarHorasSeguidas(horarios: HorarioLaboral[], estaTomado: (inicio: Date) => boolean, inicio: Date, horas: number) {
    const franjas: Franja[] = [];
    let actual = new Date(inicio);
    let vueltas = 0;
    while (franjas.length < horas) {
      if (vueltas++ > 24 * 120) {
        return null; // no hay horario cargado suficiente
      }
      if (this.esHoraDeTrabajo(horarios, actual)) {
        if (estaTomado(actual)) {
          return null;
        }
        franjas.push({ inicio: new Date(actual), fin: new Date(actual.getTime() + UNA_HORA) });
      }
      actual = new Date(actual.getTime() + UNA_HORA);
    }
    return franjas;
  }

  // "2026-10-20T10:00:00" -> fecha en hora local. Tiene que ser en punto y en el futuro
  private leerInicio(texto: string): Date {
    const inicio = new Date(texto);
    if (isNaN(inicio.getTime())) {
      throw new BadRequestException('El horario no es una fecha valida');
    }
    if (inicio.getMinutes() !== 0 || inicio.getSeconds() !== 0 || inicio.getMilliseconds() !== 0) {
      throw new BadRequestException('Los turnos son de una hora en punto (ej: 10:00, 11:00)');
    }
    if (inicio <= new Date()) {
      throw new BadRequestException('El horario tiene que ser en el futuro');
    }
    return inicio;
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

  private texto(fecha: Date) {
    return fecha.toLocaleString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}