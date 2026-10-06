import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Profesional } from './entities/profesional.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

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
  ) {}

  async create(
    createProfesionalDto: CreateProfesionalDto,
  ): Promise<Profesional> {
    const profesionalConEseCorreo = await this.profesionalRepository.findOne({ where: { correo: createProfesionalDto.correo }, withDeleted: true });
    if (profesionalConEseCorreo) {
      throw new ConflictException('Ya existe un profesional registrado con ese correo');
    }

    const clienteConEseCorreo = await this.clienteRepository.findOne({ where: { correo: createProfesionalDto.correo }, withDeleted: true });
    if (clienteConEseCorreo) {
      throw new ConflictException('Ese correo ya está registrado como cliente, usá otro correo');
    }

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

    const nuevoProfesional = this.profesionalRepository.create({
      ...createProfesionalDto,
      contraseña: await bcrypt.hash(createProfesionalDto.contraseña, 10),
      zonasDeCobertura,
      especialidades,
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
      relations: {
        zonasDeCobertura: true,
        especialidades: true,
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

    const { idsZonasCobertura, idsEspecialidades, ...resto } = updateProfesionalDto;

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

    if (resto.contraseña !== undefined) {
      resto.contraseña = await bcrypt.hash(resto.contraseña, 10);
    }

    this.profesionalRepository.merge(profesional, resto);
    return await this.profesionalRepository.save(profesional);
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
