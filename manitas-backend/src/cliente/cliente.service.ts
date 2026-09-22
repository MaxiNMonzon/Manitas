import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Zona } from '../zona/entities/zona.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const { direccion, idZonaResidencia, ...datosUsuario } = createClienteDto;

    const zonaResidencia = await this.zonaRepository.findOneBy({
      idZona: idZonaResidencia,
    });

    if (!zonaResidencia) {
      throw new BadRequestException('La zona de residencia indicada no existe');
    }

    const usuario = await this.usuarioRepository.save(
      this.usuarioRepository.create(datosUsuario),
    );

    const cliente = this.clienteRepository.create({
      idUsuario: usuario.idUsuario,
      direccion,
      zonaResidencia,
    });
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario: id },
      relations: ['usuario'],
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);
    const { direccion, idZonaResidencia, ...datosUsuario } = updateClienteDto;

    if (Object.keys(datosUsuario).length > 0) {
      this.usuarioRepository.merge(cliente.usuario, datosUsuario);
      await this.usuarioRepository.save(cliente.usuario);
    }

    if (idZonaResidencia !== undefined) {
      const zonaResidencia = await this.zonaRepository.findOneBy({ idZona: idZonaResidencia });
      if (!zonaResidencia) {
        throw new BadRequestException('La zona de residencia indicada no existe');
      }
      cliente.zonaResidencia = zonaResidencia;
    }

    if (direccion !== undefined) {
      cliente.direccion = direccion;
    }

    return await this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
    return { message: `Cliente con ID ${id} eliminado con éxito` };
  }
}
