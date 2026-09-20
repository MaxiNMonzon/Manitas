import { Module } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './entities/zona.entity';
import { LocalidadModule } from '../localidad/localidad.module';

@Module({
  imports: [TypeOrmModule.forFeature([Zona]), LocalidadModule],
  controllers: [ZonaController],
  providers: [ZonaService],
})
export class ZonaModule {}
