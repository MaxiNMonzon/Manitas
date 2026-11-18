import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Rol } from '../../common/enums/rol.enum';

// Arma el "contexto" que Nest le pasa al guard, con la petición que queremos probar
function contextoCon(request: Record<string, unknown>): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}

describe('AuthGuard (verifica el JWT)', () => {
  const jwtService = new JwtService({ secret: 'secreto-de-prueba' });
  const guard = new AuthGuard(jwtService);

  it('deja pasar un token válido y guarda el usuario en la petición', async () => {
    const token = await jwtService.signAsync({ sub: 12, correo: 'laura@test.com', rol: Rol.CLIENTE });
    const request: Record<string, any> = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextoCon(request))).resolves.toBe(true);
    expect(request.usuario).toMatchObject({ sub: 12, correo: 'laura@test.com', rol: Rol.CLIENTE });
  });

  it('rechaza la petición si no trae token', async () => {
    await expect(guard.canActivate(contextoCon({ headers: {} }))).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token firmado con otra clave (alterado o falso)', async () => {
    const falso = await new JwtService({ secret: 'otra-clave' }).signAsync({ sub: 1, rol: Rol.ADMIN });
    const request = { headers: { authorization: `Bearer ${falso}` } };
    await expect(guard.canActivate(contextoCon(request))).rejects.toThrow('Token inválido o vencido');
  });

  it('rechaza un token vencido', async () => {
    const vencido = await jwtService.signAsync({ sub: 1, rol: Rol.CLIENTE }, { expiresIn: '-1s' });
    const request = { headers: { authorization: `Bearer ${vencido}` } };
    await expect(guard.canActivate(contextoCon(request))).rejects.toThrow(UnauthorizedException);
  });

  it('ignora un header que no sea "Bearer"', async () => {
    const request = { headers: { authorization: 'Basic dXN1YXJpbzpjbGF2ZQ==' } };
    await expect(guard.canActivate(contextoCon(request))).rejects.toThrow('Falta el token');
  });
});
