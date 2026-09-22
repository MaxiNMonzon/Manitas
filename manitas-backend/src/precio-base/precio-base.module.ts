import { Module } from '@nestjs/common';
import { PrecioBaseService } from './precio-base.service';
import { PrecioBaseController } from './precio-base.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrecioBase } from './entities/precio-base.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Profesional } from '../profesional/entities/profesional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrecioBase, Especialidad, Profesional])],
  controllers: [PrecioBaseController],
  providers: [PrecioBaseService],
})
export class PrecioBaseModule {}