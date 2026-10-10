import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetaService } from './tarjeta.service';
import { TarjetaController } from './tarjeta.controller';
import { Tarjeta } from './entities/tarjeta.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarjeta, Cliente, MetodoDePago])],
  controllers: [TarjetaController],
  providers: [TarjetaService],
})
export class TarjetaModule {}
