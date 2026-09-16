import { Module } from '@nestjs/common';
import { TipoDeServicioService } from './tipo-de-servicio.service';
import { TipoDeServicioController } from './tipo-de-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDeServicio } from './entities/tipo-de-servicio.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { EspecialidadModule } from '../especialidad/especialidad.module';
import { EspecialidadService } from '../especialidad/especialidad.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDeServicio]), EspecialidadModule],
  controllers: [TipoDeServicioController],
  providers: [TipoDeServicioService],
}) //importa las modulos TiposDeServicio y Especialidad y crea automáticamente 
//el controlador y proveedor de servicio de TiposDeServicio.
export class TipoDeServicioModule {}
