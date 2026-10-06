import { Module } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { SolicitudDeServicioController } from './solicitud-de-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Tarjeta } from '../tarjeta/entities/tarjeta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudDeServicio, Cliente, Profesional, Tarjeta]),
  ],
  controllers: [SolicitudDeServicioController],
  providers: [SolicitudDeServicioService],
})
export class SolicitudDeServicioModule {}