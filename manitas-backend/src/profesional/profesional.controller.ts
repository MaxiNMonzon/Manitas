import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  @Get()
  findAll() {
    return this.profesionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.PROFESIONAL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesionalDto: UpdateProfesionalDto,
    @UsuarioActivo() usuario: UsuarioActivoInterface,
  ) {
    return this.profesionalService.update(id, updateProfesionalDto, usuario.sub);
  }

  @Delete(':id')
  @Auth(Rol.PROFESIONAL)
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.profesionalService.remove(id, usuario.sub);
  }
}
