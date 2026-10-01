import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProfesionalModule } from '../profesional/profesional.module';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports:[ProfesionalModule, ClienteModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
