import { Module } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { SolicitudDeServicioController } from './solicitud-de-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { MetodoDePagoModule } from '../metodo-de-pago/metodo-de-pago.module';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudDeServicio]), MetodoDePagoModule],
  controllers: [SolicitudDeServicioController],
  providers: [SolicitudDeServicioService],
})
export class SolicitudDeServicioModule {}
