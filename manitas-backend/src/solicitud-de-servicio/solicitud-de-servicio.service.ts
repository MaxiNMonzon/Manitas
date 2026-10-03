import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Injectable()
export class SolicitudDeServicioService {
  constructor(
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudDeServicioRepository: Repository<SolicitudDeServicio>,

    @InjectRepository(MetodoDePago)
    private readonly metodoDePagoRepository: Repository<MetodoDePago>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
  ) {}

  async create(createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, idCliente: number) {
    const metodoPago = await this.metodoDePagoRepository.findOneBy({
      idFormaPago: createSolicitudDeServicioDto.idMetodoPago,
    });

    if (!metodoPago) {
      throw new BadRequestException('El metodo de pago indicado no existe');
    }

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

    return await this.solicitudDeServicioRepository.save({
      ...createSolicitudDeServicioDto,
      metodoPago,
      cliente,
      profesional,
    });
  }

  async findAll(usuario: UsuarioActivoInterface) {
    if (usuario.rol === Rol.CLIENTE) {
      return await this.solicitudDeServicioRepository.find({
        where: { cliente: { idUsuario: usuario.sub } },
      });
    }
    return await this.solicitudDeServicioRepository.find({
      where: { profesional: { idUsuario: usuario.sub } },
    });
  }

  async findOne(id: number, usuario: UsuarioActivoInterface) {
    const solicitudDeServicio = await this.solicitudDeServicioRepository.findOne({
      where: { idSolicitud: id },
      relations: { cliente: true, profesional: true, metodoPago: true },
    });
    if (!solicitudDeServicio) {
      throw new NotFoundException(`SolicitudDeServicio con ID ${id} no encontrada`);
    }

    const esElCliente = usuario.rol === Rol.CLIENTE && solicitudDeServicio.cliente?.idUsuario === usuario.sub;
    const esElProfesional = usuario.rol === Rol.PROFESIONAL && solicitudDeServicio.profesional?.idUsuario === usuario.sub;
    if (!esElCliente && !esElProfesional) {
      throw new ForbiddenException('No participás de esta solicitud');
    }

    return solicitudDeServicio;
  }

  async update(id: number, updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto, usuario: UsuarioActivoInterface) {
    const solicitudDeServicio = await this.findOne(id, usuario);
    this.solicitudDeServicioRepository.merge(solicitudDeServicio, updateSolicitudDeServicioDto);
    return await this.solicitudDeServicioRepository.save(solicitudDeServicio);
  }

  async remove(id: number, usuario: UsuarioActivoInterface) {
    await this.findOne(id, usuario);
    return await this.solicitudDeServicioRepository.softDelete({ idSolicitud: id });
  }
}
