import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Rol } from '../../common/enums/rol.enum';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';

// Ademas de proteger la ruta, la marca con candado en Swagger
export function Auth(rol: Rol) {
  return applyDecorators(
    Roles(rol),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' }),
    ApiForbiddenResponse({ description: `Solo para el rol ${rol}, o no es tuyo` }),
  );
}
