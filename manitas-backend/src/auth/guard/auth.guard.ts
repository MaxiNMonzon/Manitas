import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extraerTokenDelHeader(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    return true;
  }

  private extraerTokenDelHeader(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
