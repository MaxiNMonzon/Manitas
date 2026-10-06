import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Controller('solicitud-de-servicio')
export class SolicitudDeServicioController {
  constructor(private readonly solicitudDeServicioService: SolicitudDeServicioService) {}

  @Post()
  @Auth(Rol.CLIENTE)
  create(@Body() createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.create(createSolicitudDeServicioDto, usuario.sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.findAll(usuario);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.findOne(id, usuario);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.update(id, updateSolicitudDeServicioDto, usuario);
  }

  @Delete(':id')
  @Auth(Rol.CLIENTE)
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.remove(id, usuario);
  }
}