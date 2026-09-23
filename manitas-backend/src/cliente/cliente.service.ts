import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Zona } from '../zona/entities/zona.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
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
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: id });
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

    const { idZonaResidencia, ...resto } = updateClienteDto;

    if (idZonaResidencia !== undefined) {
      const zonaResidencia = await this.zonaRepository.findOneBy({ idZona: idZonaResidencia });
      if (!zonaResidencia) {
        throw new BadRequestException('La zona de residencia indicada no existe');
      }
      cliente.zonaResidencia = zonaResidencia;
    }

    this.clienteRepository.merge(cliente, resto);
    return await this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
    return { message: `Cliente con ID ${id} eliminado con éxito` };
  }
}
