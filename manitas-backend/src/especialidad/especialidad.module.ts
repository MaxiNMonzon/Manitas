import { Module } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadController } from './especialidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidad } from './entities/especialidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature ([Especialidad])],
  controllers: [EspecialidadController],
  providers: [EspecialidadService],
})
export class EspecialidadModule {}
