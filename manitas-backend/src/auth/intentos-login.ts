import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';

export const MAX_INTENTOS = 3;
export const MINUTOS_BLOQUEO = 15;

// Cuenta los logins fallidos de cada cuenta (rol + correo). Al tercero seguido, esa cuenta queda
// bloqueada 15 minutos: así no se pueden probar contraseñas una atrás de otra.
// Se guarda en memoria: si el servidor se reinicia, los contadores vuelven a cero
export class IntentosLogin {
  private readonly fallidos = new Map<string, { cantidad: number; bloqueadaHasta: number | null }>();

  private clave(rol: string, correo: string) {
    return `${rol}:${correo.trim().toLowerCase()}`;
  }

  // Antes de revisar la contraseña: si la cuenta está bloqueada, ni siquiera se prueba
  verificar(rol: string, correo: string) {
    const registro = this.fallidos.get(this.clave(rol, correo));
    if (!registro?.bloqueadaHasta) return;
    const faltan = registro.bloqueadaHasta - Date.now();
    if (faltan <= 0) {
      // Ya pasó el bloqueo: empieza de cero
      this.fallidos.delete(this.clave(rol, correo));
      return;
    }
    throw this.errorBloqueo(Math.ceil(faltan / 60000));
  }

  // Contraseña mal: suma un intento y avisa cuántos le quedan (o bloquea si era el último)
  fallo(rol: string, correo: string): never {
    const clave = this.clave(rol, correo);
    const registro = this.fallidos.get(clave) ?? { cantidad: 0, bloqueadaHasta: null };
    registro.cantidad++;
    if (registro.cantidad >= MAX_INTENTOS) {
      registro.bloqueadaHasta = Date.now() + MINUTOS_BLOQUEO * 60000;
      this.fallidos.set(clave, registro);
      throw this.errorBloqueo(MINUTOS_BLOQUEO);
    }
    this.fallidos.set(clave, registro);
    const quedan = MAX_INTENTOS - registro.cantidad;
    throw new UnauthorizedException(
      `Correo o contraseña incorrectos. Te ${quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`}.`,
    );
  }

  // Entró bien: se borran los intentos fallidos
  exito(rol: string, correo: string) {
    this.fallidos.delete(this.clave(rol, correo));
  }

  private errorBloqueo(minutos: number) {
    return new HttpException(
      `Demasiados intentos fallidos. Por seguridad, probá de nuevo en ${minutos} minuto${minutos === 1 ? '' : 's'}.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
