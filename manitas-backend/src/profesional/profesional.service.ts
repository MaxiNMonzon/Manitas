import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Profesional } from './entities/profesional.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { TiposDeServicio } from '../tipos-de-servicio/entities/tipos-de-servicio.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { MatriculaDto } from './dto/matricula.dto';
import { Matricula } from './entities/matricula.entity';

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,

    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,

    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepository: Repository<SolicitudDeServicio>,

    @InjectRepository(TiposDeServicio)
    private readonly tiposDeServicioRepository: Repository<TiposDeServicio>,
  ) {}

  async create(
    createProfesionalDto: CreateProfesionalDto,
  ): Promise<Profesional> {
    await this.validarCorreoLibre(createProfesionalDto.correo);

    const zonasDeCobertura = await this.zonaRepository.findBy({
      idZona: In(createProfesionalDto.idsZonasCobertura),
    });

    if (zonasDeCobertura.length !== createProfesionalDto.idsZonasCobertura.length) {
      throw new BadRequestException('Alguna de las zonas de cobertura indicadas no existe');
    }

    const especialidades = await this.especialidadRepository.findBy({
      idEspecialidad: In(createProfesionalDto.idsEspecialidades),
    });

    if (especialidades.length !== createProfesionalDto.idsEspecialidades.length) {
      throw new BadRequestException('Alguna de las especialidades indicadas no existe');
    }

    const tiposDeServicio = await this.buscarTiposDeServicio(
      createProfesionalDto.idsTiposDeServicio ?? [],
      createProfesionalDto.idsEspecialidades,
    );

    const { matriculas, ...datos } = createProfesionalDto;
    const nuevoProfesional = this.profesionalRepository.create({
      ...datos,
      contraseña: await bcrypt.hash(createProfesionalDto.contraseña, 10),
      zonasDeCobertura,
      especialidades,
      tiposDeServicio,
      matriculas: this.armarMatriculas(matriculas ?? [], especialidades),
    });
    return await this.profesionalRepository.save(nuevoProfesional);
  }

  async findAll(idEspecialidad?: number, idZona?: number): Promise<Profesional[]> {
    const query = this.profesionalRepository
      .createQueryBuilder('profesional')
      .leftJoinAndSelect('profesional.zonasDeCobertura', 'zona')
      .leftJoinAndSelect('profesional.especialidades', 'especialidad');

    // Los filtros usan joins aparte para no recortar las zonas y especialidades que se devuelven
    if (idEspecialidad) {
      query
        .innerJoin('profesional.especialidades', 'especialidadFiltro')
        .andWhere('especialidadFiltro.idEspecialidad = :idEspecialidad', { idEspecialidad });
    }

    if (idZona) {
      query
        .innerJoin('profesional.zonasDeCobertura', 'zonaFiltro')
        .andWhere('zonaFiltro.idZona = :idZona', { idZona });
    }

    return await query.getMany();
  }

  async findOneByEmail(correo: string) {
    return await this.profesionalRepository.findOneBy({ correo });
  }

  async findOne(id: number): Promise<Profesional> {
    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: id },
      // Con la localidad de cada zona y la especialidad de cada habilidad, para mostrarlas en el perfil
      relations: {
        zonasDeCobertura: { localidad: { provincia: true } },
        especialidades: true,
        tiposDeServicio: { especialidad: true },
        matriculas: { especialidad: true },
      },
    });
    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }
    return profesional;
  }

  // Promedio y reseñas del profesional, para que los clientes lo puedan elegir.
  // Del cliente solo se muestra el nombre
  async calificaciones(id: number) {
    await this.findOne(id);
    const calificadas = await this.solicitudRepository.find({
      where: { profesional: { idUsuario: id }, calificacionServicio: Not(IsNull()) },
      relations: { cliente: true },
      order: { fechaFinReal: 'DESC' },
    });

    let suma = 0;
    for (const solicitud of calificadas) {
      suma += solicitud.calificacionServicio;
    }
    const promedio = calificadas.length > 0 ? Math.round((suma / calificadas.length) * 10) / 10 : null;

    return {
      promedio,
      cantidad: calificadas.length,
      reseñas: calificadas.map((solicitud) => ({
        calificacion: solicitud.calificacionServicio,
        reseña: solicitud.reseñaServicio,
        fecha: solicitud.fechaFinReal,
        cliente: solicitud.cliente.nombre,
      })),
    };
  }

  async update(
    id: number,
    updateProfesionalDto: UpdateProfesionalDto,
    idLogueado: number,
  ): Promise<Profesional> {
    this.validarQueEsSuCuenta(id, idLogueado);
    const profesional = await this.findOne(id);

    const { idsZonasCobertura, idsEspecialidades, idsTiposDeServicio, matriculas, ...resto } = updateProfesionalDto;

    // El correo se puede cambiar, pero no a uno que ya use otra cuenta (de cliente o de profesional)
    if (resto.correo !== undefined && resto.correo !== profesional.correo) {
      await this.validarCorreoLibre(resto.correo);
    }

    if (idsZonasCobertura !== undefined) {
      const zonasDeCobertura = await this.zonaRepository.findBy({
        idZona: In(idsZonasCobertura),
      });

      if (zonasDeCobertura.length !== idsZonasCobertura.length) {
        throw new BadRequestException('Alguna de las zonas de cobertura indicadas no existe');
      }
      profesional.zonasDeCobertura = zonasDeCobertura;
    }

    if (idsEspecialidades !== undefined) {
      const especialidades = await this.especialidadRepository.findBy({
        idEspecialidad: In(idsEspecialidades),
      });

      if (especialidades.length !== idsEspecialidades.length) {
        throw new BadRequestException('Alguna de las especialidades indicadas no existe');
      }
      profesional.especialidades = especialidades;
    }

    if (idsTiposDeServicio !== undefined) {
      profesional.tiposDeServicio = await this.buscarTiposDeServicio(
        idsTiposDeServicio,
        profesional.especialidades.map((e) => e.idEspecialidad),
      );
    }

    if (matriculas !== undefined) {
      profesional.matriculas = this.armarMatriculas(matriculas, profesional.especialidades);
    } else if (idsEspecialidades !== undefined) {
      // Si dejo una especialidad, sus matriculas tambien se van
      const ids = new Set(profesional.especialidades.map((e) => e.idEspecialidad));
      profesional.matriculas = profesional.matriculas.filter((m) => ids.has(m.especialidad.idEspecialidad));
    }

    if (resto.contraseña !== undefined) {
      resto.contraseña = await bcrypt.hash(resto.contraseña, 10);
    }

    this.profesionalRepository.merge(profesional, resto);
    await this.profesionalRepository.save(profesional);
    return await this.findOne(id);
  }

  // El correo no se puede repetir entre clientes y profesionales, ni con cuentas dadas de baja
  private async validarCorreoLibre(correo: string) {
    const profesionalConEseCorreo = await this.profesionalRepository.findOne({ where: { correo }, withDeleted: true });
    if (profesionalConEseCorreo) {
      throw new ConflictException('Ya existe un profesional registrado con ese correo');
    }
    const clienteConEseCorreo = await this.clienteRepository.findOne({ where: { correo }, withDeleted: true });
    if (clienteConEseCorreo) {
      throw new ConflictException('Ese correo ya está registrado como cliente, usá otro correo');
    }
  }

  // Cada matricula tiene que ser de una de las especialidades del profesional, sin numeros repetidos
  private armarMatriculas(dtos: MatriculaDto[], especialidades: Especialidad[]): Matricula[] {
    const vistas = new Set<string>();
    return dtos.map((dto) => {
      const especialidad = especialidades.find((e) => e.idEspecialidad === dto.idEspecialidad);
      if (!especialidad) {
        throw new BadRequestException(`La matricula ${dto.numero} es de una especialidad que no tenes`);
      }
      const clave = `${dto.idEspecialidad}-${dto.numero.trim().toLowerCase()}`;
      if (vistas.has(clave)) {
        throw new BadRequestException(`Repetiste la matricula ${dto.numero}`);
      }
      vistas.add(clave);
      const matricula = new Matricula();
      matricula.numero = dto.numero.trim();
      matricula.descripcion = dto.descripcion?.trim() || null;
      matricula.especialidad = especialidad;
      return matricula;
    });
  }

  // Las habilidades (tipos de servicio) tienen que existir y ser de alguna de las especialidades del profesional
  private async buscarTiposDeServicio(idsTiposDeServicio: number[], idsEspecialidades: number[]): Promise<TiposDeServicio[]> {
    if (idsTiposDeServicio.length === 0) return [];

    const tiposDeServicio = await this.tiposDeServicioRepository.find({
      where: { idServicio: In(idsTiposDeServicio) },
      relations: { especialidad: true },
    });
    if (tiposDeServicio.length !== idsTiposDeServicio.length) {
      throw new BadRequestException('Alguna de las habilidades indicadas no existe');
    }
    const fueraDeEspecialidad = tiposDeServicio.find((t) => !idsEspecialidades.includes(t.especialidad.idEspecialidad));
    if (fueraDeEspecialidad) {
      throw new BadRequestException(`La habilidad "${fueraDeEspecialidad.nombreServicio}" no es de ninguna de tus especialidades`);
    }
    return tiposDeServicio;
  }

  async remove(id: number, idLogueado: number): Promise<{ message: string }> {
    this.validarQueEsSuCuenta(id, idLogueado);
    await this.findOne(id);
    await this.profesionalRepository.softDelete({ idUsuario: id });
    return { message: `Profesional con ID ${id} eliminado` };
  }

  private validarQueEsSuCuenta(id: number, idLogueado: number) {
    if (id !== idLogueado) {
      throw new ForbiddenException('Solo podés modificar tu propia cuenta');
    }
  }
}