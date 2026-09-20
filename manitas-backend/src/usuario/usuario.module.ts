import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from './entities/usuario.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRETO_SUPER_SEGURO',
      signOptions: { expiresIn: '12h' },
    }),

],
  controllers: [UsuarioController], //El usuario gestiona sus controladores.
  providers: [
    UsuarioService,
    JwtAuthGuard,
    RolesGuard,
  ],  //El usuario ya gestiona sus servicios.
  exports: [UsuarioService, JwtModule],
})//Los controladores y proveedores de servicios se generan automáticamente.
export class UsuarioModule {}
