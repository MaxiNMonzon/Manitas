import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController], //El usuario gestiona sus controladores.
  providers: [UsuarioService], //El usuario ya gestiona sus servicios.
})//Los controladores y proveedores de servicios se generan automáticamente.
export class UsuarioModule {}
