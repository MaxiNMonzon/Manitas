import { Module } from '@nestjs/common';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { TiposDeServicioController } from './tipos-de-servicio.controller';

@Module({
  controllers: [TiposDeServicioController],
  providers: [TiposDeServicioService],
})
export class TiposDeServicioModule {}
