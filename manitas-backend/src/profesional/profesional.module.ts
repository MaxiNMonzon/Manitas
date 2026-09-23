import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesionalService } from './profesional.service';
import { ProfesionalController } from './profesional.controller';
import { Profesional } from './entities/profesional.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { PrecioBase } from '../precio-base/entities/precio-base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesional, Zona, Especialidad, PrecioBase])],
  controllers: [ProfesionalController],
  providers: [ProfesionalService],
})
export class ProfesionalModule {}
