import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesionalService } from './profesional.service';
import { ProfesionalController } from './profesional.controller';
import { Profesional } from './entities/profesional.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesional, Zona, Especialidad, Cliente, SolicitudDeServicio])],
  controllers: [ProfesionalController],
  providers: [ProfesionalService],
  exports: [ProfesionalService],
})
export class ProfesionalModule {}
