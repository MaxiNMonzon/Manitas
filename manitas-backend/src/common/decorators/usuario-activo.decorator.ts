import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UsuarioActivo = createParamDecorator(
  (data: unknown, contexto: ExecutionContext) => {
    const request = contexto.switchToHttp().getRequest();
    return request.usuario;
  },
);
