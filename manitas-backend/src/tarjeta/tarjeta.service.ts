import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarjeta } from './entities/tarjeta.entity';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { Cliente } from '../cliente/entities/cliente.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { mejorPromocionVigente } from '../promocion/mejor-promocion';

@Injectable()
export class TarjetaService {
  constructor(
    @InjectRepository(Tarjeta)
    private readonly tarjetaRepository: Repository<Tarjeta>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(MetodoDePago)
    private readonly metodoDePagoRepository: Repository<MetodoDePago>,
  ) {}

  async create(createTarjetaDto: CreateTarjetaDto, idCliente: number) {
    const cliente = await this.clienteRepository.findOneBy({ idUsuario: idCliente });
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    const metodoDePago = await this.metodoDePagoRepository.findOneBy({
      idFormaPago: createTarjetaDto.idMetodoDePago,
    });
    if (!metodoDePago) {
      throw new BadRequestException('El metodo de pago indicado no existe');
    }

    if (this.estaVencida(createTarjetaDto.mesVencimiento, createTarjetaDto.anioVencimiento)) {
      throw new BadRequestException('La tarjeta esta vencida');
    }

    return await this.tarjetaRepository.save({
      ...createTarjetaDto,
      cliente,
      metodoDePago,
    });
  }

  // Solo las tarjetas del cliente logueado
  async findAll(idCliente: number) {
    return await this.tarjetaRepository.find({
      where: { cliente: { idUsuario: idCliente } },
      relations: { metodoDePago: true },
    });
  }

  // Las tarjetas del cliente con la mejor promo vigente hoy de cada una,
  // para que elija con cual pagar
  async conPromociones(idCliente: number) {
    const tarjetas = await this.tarjetaRepository.find({
      where: { cliente: { idUsuario: idCliente } },
      relations: { metodoDePago: { promociones: true } },
    });

    return tarjetas.map((tarjeta) => {
      const promocion = mejorPromocionVigente(tarjeta.metodoDePago.promociones);
      return {
        idTarjeta: tarjeta.idTarjeta,
        alias: tarjeta.alias,
        ultimosDigitos: tarjeta.ultimosDigitos,
        metodoDePago: tarjeta.metodoDePago.tipo,
        promocion: promocion
          ? { descripcion: promocion.descripcion, porcentaje: Number(promocion.porcentajeDescuento), hasta: promocion.fechaFinVigencia }
          : null,
      };
    });
  }

  async findOne(id: number, idCliente: number) {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { idTarjeta: id },
      relations: { cliente: true, metodoDePago: true },
    });
    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }
    if (tarjeta.cliente.idUsuario !== idCliente) {
      throw new ForbiddenException('Esa tarjeta no es tuya');
    }
    return tarjeta;
  }

  async remove(id: number, idCliente: number) {
    await this.findOne(id, idCliente);
    return await this.tarjetaRepository.softDelete({ idTarjeta: id });
  }

  // Vence al terminar el mes que dice la tarjeta
  private estaVencida(mes: number, anio: number) {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    return anio < anioActual || (anio === anioActual && mes < mesActual);
  }
}