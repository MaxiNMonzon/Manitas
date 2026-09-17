import { Module } from '@nestjs/common';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { TiposDeServicioController } from './tipos-de-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposDeServicio } from './entities/tipos-de-servicio.entity';
import { EspecialidadModule } from '../especialidad/especialidad.module';

@Module({
  imports: [TypeOrmModule.forFeature([TiposDeServicio]), EspecialidadModule],
  controllers: [TiposDeServicioController],
  providers: [TiposDeServicioService],
})
export class TiposDeServicioModule {}
