import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Profesional } from './entities/profesional.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Zona } from '../zona/entities/zona.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
  ) {}

  async create(
    createProfesionalDto: CreateProfesionalDto,
  ): Promise<Profesional> {
    const { nroMatricula, idsZonasCobertura, ...datosUsuario } = createProfesionalDto;

    const zonasDeCobertura = await this.zonaRepository.findBy({
      idZona: In(idsZonasCobertura),
    });

    if (zonasDeCobertura.length !== idsZonasCobertura.length) {
      throw new BadRequestException('Alguna de las zonas de cobertura indicadas no existe');
    }

    const usuario = await this.usuarioRepository.save(
      this.usuarioRepository.create(datosUsuario),
    );

    const nuevoProfesional = this.profesionalRepository.create({
      idUsuario: usuario.idUsuario,
      nroMatricula,
      zonasDeCobertura,
    });
    return await this.profesionalRepository.save(nuevoProfesional);
  }

  async findAll(): Promise<Profesional[]> {
    return await this.profesionalRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Profesional> {
    const profesional = await this.profesionalRepository.findOne({
      where: { idUsuario: id },
      relations: ['usuario'],
    });
    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }
    return profesional;
  }

  async update(
    id: number,
    updateProfesionalDto: UpdateProfesionalDto,
  ): Promise<Profesional> {
    const profesional = await this.findOne(id);
    const { nroMatricula, idsZonasCobertura, ...datosUsuario } = updateProfesionalDto;

    if (Object.keys(datosUsuario).length > 0) {
      this.usuarioRepository.merge(profesional.usuario, datosUsuario);
      await this.usuarioRepository.save(profesional.usuario);
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

    if (nroMatricula !== undefined) {
      profesional.nroMatricula = nroMatricula;
    }

    return await this.profesionalRepository.save(profesional);
  }

  async remove(id: number): Promise<{ message: string }> {
    const profesional = await this.findOne(id);
    await this.profesionalRepository.remove(profesional);
    return { message: `Profesional con ID ${id} eliminado` };
  }
}
