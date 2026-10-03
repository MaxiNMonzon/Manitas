import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PrecioBaseService } from './precio-base.service';
import { CreatePrecioBaseDto } from './dto/create-precio-base.dto';
import { UpdatePrecioBaseDto } from './dto/update-precio-base.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Controller('precio-base')
export class PrecioBaseController {
  constructor(private readonly precioBaseService: PrecioBaseService) {}

  @Post()
  @Auth(Rol.PROFESIONAL)
  create(@Body() createPrecioBaseDto: CreatePrecioBaseDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.precioBaseService.create(createPrecioBaseDto, usuario.sub);
  }

  @Get()
  findAll() {
    return this.precioBaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.precioBaseService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.PROFESIONAL)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePrecioBaseDto: UpdatePrecioBaseDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.precioBaseService.update(id, updatePrecioBaseDto, usuario.sub);
  }

  @Delete(':id')
  @Auth(Rol.PROFESIONAL)
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.precioBaseService.remove(id, usuario.sub);
  }
}
