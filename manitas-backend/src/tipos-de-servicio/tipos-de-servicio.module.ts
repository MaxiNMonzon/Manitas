import { Module } from '@nestjs/common';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { TiposDeServicioController } from './tipos-de-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposDeServicio } from './entities/tipos-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TiposDeServicio, Especialidad])],
  controllers: [TiposDeServicioController],
  providers: [TiposDeServicioService],
})
export class TiposDeServicioModule {}
