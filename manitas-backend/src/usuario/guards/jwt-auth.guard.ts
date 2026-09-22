import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
       private readonly jwtService: JwtService,
       @InjectRepository(Usuario)
       private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticación no proporcionado');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Verificar si el usuario fue dado de baja posteriormente
      const usuario = await this.usuarioRepository.findOne({ where: { idUsuario: payload.sub } });
      if (!usuario || usuario.fechaBaja !== null) {
        throw new UnauthorizedException('La cuenta de usuario se encuentra inhabilitada');
      }

      request.user = payload;
      return true;
    } catch (error){
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token no válido o expirado');
    }
  }
}