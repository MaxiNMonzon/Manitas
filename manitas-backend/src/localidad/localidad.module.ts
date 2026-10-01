import { Module } from '@nestjs/common';
import { LocalidadService } from './localidad.service';
import { LocalidadController } from './localidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localidad } from './entities/localidad.entity';
import { ProvinciaModule } from '../provincia/provincia.module';
@Module({
  imports: [TypeOrmModule.forFeature([Localidad]), ProvinciaModule ],
  controllers: [LocalidadController],
  providers: [LocalidadService],
  exports: [TypeOrmModule],
})
export class LocalidadModule {}