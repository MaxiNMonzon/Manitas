import { BadRequestException, ConflictException, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Cliente } from './entities/cliente.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,

    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
  ) {}

  /*async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const clienteConEseCorreo = await this.clienteRepository.findOne({
      where: { correo: createClienteDto.correo },
      withDeleted: true,
    });
    if (clienteConEseCorreo) {
      throw new ConflictException('Ya existe un cliente registrado con ese correo');
    }

    const profesionalConEseCorreo = await this.profesionalRepository.findOne({
      where: { correo: createClienteDto.correo },
      withDeleted: true,
    });
    if (profesionalConEseCorreo) {
      throw new ConflictException(
        'Ese correo ya está registrado como profesional, usá otro correo',
      );
    }

    const zonaResidencia = await this.zonaRepository.findOneBy({
      idZona: createClienteDto.idZonaResidencia,
    });
    if (!zonaResidencia) {
      throw new BadRequestException('La zona de residencia indicada no existe');
    }

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      zonaResidencia,
    });
    return await this.clienteRepository.save(cliente);
  }*/
 async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const clienteConEseCorreo = await this.clienteRepository.findOne({ where: { correo: createClienteDto.correo }, withDeleted: true });
    if (clienteConEseCorreo) {
      throw new ConflictException('Ya existe un cliente registrado con ese correo');
    }

    const profesionalConEseCorreo = await this.profesionalRepository.findOne({ where: { correo: createClienteDto.correo }, withDeleted: true });
    if (profesionalConEseCorreo) {
      throw new ConflictException('Ese correo ya está registrado como profesional, usá otro correo');
    }

    const zonaResidencia = await this.zonaRepository.findOneBy({
      idZona: createClienteDto.idZonaResidencia,
    });

    if (!zonaResidencia) {
      throw new BadRequestException('La zona de residencia indicada no existe');
    }

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      contraseña: await bcrypt.hash(createClienteDto.contraseña, 10),
      zonaResidencia,
    });
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      relations: {
        zonaResidencia: { localidad: { provincia: true } },
      },
    });
  }
   async findOnePropio(id: number, idLogueado: number): Promise<Cliente> {
    this.validarQueEsSuCuenta(id, idLogueado);
    return await this.findOne(id);
  }

  async findOneByEmail(correo: string) {
    return await this.clienteRepository.findOneBy({ correo });
  }
  /* async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: id });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }*/

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario: id },
      relations: {
        zonaResidencia: { localidad: { provincia: true } },
      },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  /*async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);
    const { idZonaResidencia, ...resto } = updateClienteDto;

    if (idZonaResidencia !== undefined) {
      const zonaResidencia = await this.zonaRepository.findOneBy({
        idZona: idZonaResidencia,
      });
      if (!zonaResidencia) {
        throw new BadRequestException('La zona de residencia indicada no existe');
      }
      cliente.zonaResidencia = zonaResidencia;
    }

    this.clienteRepository.merge(cliente, resto);
    return await this.clienteRepository.save(cliente);
  }*/
  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
    idLogueado: number,
  ): Promise<Cliente> {
    this.validarQueEsSuCuenta(id, idLogueado);
    const cliente = await this.findOne(id);

    const { idZonaResidencia, ...resto } = updateClienteDto;

    if (idZonaResidencia !== undefined) {
      const zonaResidencia = await this.zonaRepository.findOneBy({ idZona: idZonaResidencia });
      if (!zonaResidencia) {
        throw new BadRequestException('La zona de residencia indicada no existe');
      }
      cliente.zonaResidencia = zonaResidencia;
    }

    if (resto.contraseña !== undefined) {
      resto.contraseña = await bcrypt.hash(resto.contraseña, 10);
    }

    this.clienteRepository.merge(cliente, resto);
    return await this.clienteRepository.save(cliente);
  }


/*  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.clienteRepository.softDelete({ idUsuario: id });
    return { message: `Cliente con ID ${id} eliminado con éxito` };
  }*/
 
 async remove(id: number, idLogueado: number): Promise<{ message: string }> {
    this.validarQueEsSuCuenta(id, idLogueado);
    await this.findOne(id);
    await this.clienteRepository.softDelete({ idUsuario: id });
    return { message: `Cliente con ID ${id} eliminado con éxito` };
  }

  private validarQueEsSuCuenta(id: number, idLogueado: number) {
    if (id !== idLogueado) {
      throw new ForbiddenException('Solo podés ver o modificar tu propia cuenta');
    }
  }
}