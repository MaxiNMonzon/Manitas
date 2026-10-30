import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Rol } from '../../common/enums/rol.enum';

// El rol que pide el endpoint (lo que dejaría @Auth(rol)) y el usuario que dejó el AuthGuard
function contexto(rolPedido: Rol | undefined, usuario: { rol: Rol }) {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(rolPedido) } as unknown as Reflector;
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ usuario }) }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), context };
}

describe('RolesGuard (niveles de acceso)', () => {
  it('deja pasar si el rol del usuario es el que pide el endpoint', () => {
    const { guard, context } = contexto(Rol.PROFESIONAL, { rol: Rol.PROFESIONAL });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('no deja pasar a un cliente a un endpoint de profesional', () => {
    const { guard, context } = contexto(Rol.PROFESIONAL, { rol: Rol.CLIENTE });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('no deja pasar a un cliente a un endpoint de administrador', () => {
    const { guard, context } = contexto(Rol.ADMIN, { rol: Rol.CLIENTE });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('deja pasar a cualquier usuario logueado si el endpoint no pide un rol', () => {
    const { guard, context } = contexto(undefined, { rol: Rol.CLIENTE });
    expect(guard.canActivate(context)).toBe(true);
  });
});
