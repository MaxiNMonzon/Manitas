import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no define el decorador @Roles(), se permite el acceso por defecto
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.rol) {
      throw new ForbiddenException('No tenés permisos para acceder a este recurso');
    }

    const tienePermiso = rolesRequeridos.includes(user.rol);
    if (!tienePermiso) {
      throw new ForbiddenException(`Se requiere el rol [${rolesRequeridos.join(', ')}] para realizar esta acción`);
    }

    return true;
  }
}