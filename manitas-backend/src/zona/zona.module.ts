import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';
import { Zona } from './entities/zona.entity';
import { LocalidadModule } from '../localidad/localidad.module';

@Module({
  imports: [TypeOrmModule.forFeature ([Zona]), LocalidadModule],
  controllers: [ZonaController],
  providers: [ZonaService],
  exports: [TypeOrmModule],
  
})
export class ZonaModule {}