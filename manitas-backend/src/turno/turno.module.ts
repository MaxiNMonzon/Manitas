import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnoService } from './turno.service';
import { TurnoController } from './turno.controller';
import { Turno } from './entities/turno.entity';
import { HorarioLaboral } from './entities/horario-laboral.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, HorarioLaboral, Profesional, SolicitudDeServicio])],
  controllers: [TurnoController],
  providers: [TurnoService],
  // La solicitud lo usa para reservar y liberar turnos
  exports: [TurnoService],
})
export class TurnoModule {}