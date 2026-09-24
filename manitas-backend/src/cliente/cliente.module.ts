import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Profesional } from '../profesional/entities/profesional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Zona, Profesional])],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}