import { applyDecorators, UseGuards } from '@nestjs/common';
import { Rol } from '../../common/enums/rol.enum';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';

export function Auth(rol: Rol) {
  return applyDecorators(Roles(rol), UseGuards(AuthGuard, RolesGuard));
}
