import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { AgendarDto } from './dto/agendar.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
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

  // Pasos del profesional

  @Patch(':id/aceptar')
  @Auth(Rol.PROFESIONAL)
  aceptar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptar(id, usuario);
  }

  @Patch(':id/rechazar')
  @Auth(Rol.PROFESIONAL)
  rechazar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazar(id, usuario);
  }

  @Patch(':id/agendar')
  @Auth(Rol.PROFESIONAL)
  agendar(@Param('id', ParseIntPipe) id: number, @Body() agendarDto: AgendarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.agendar(id, agendarDto, usuario);
  }

  @Patch(':id/presupuestar')
  @Auth(Rol.PROFESIONAL)
  presupuestar(@Param('id', ParseIntPipe) id: number, @Body() presupuestarDto: PresupuestarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.presupuestar(id, presupuestarDto, usuario);
  }

  // Pasos del cliente

  @Patch(':id/aceptar-presupuesto')
  @Auth(Rol.CLIENTE)
  aceptarPresupuesto(@Param('id', ParseIntPipe) id: number, @Body() aceptarPresupuestoDto: AceptarPresupuestoDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptarPresupuesto(id, aceptarPresupuestoDto, usuario);
  }

  @Patch(':id/rechazar-presupuesto')
  @Auth(Rol.CLIENTE)
  rechazarPresupuesto(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazarPresupuesto(id, usuario);
  }

  // Pasos de los dos (findOne ya controla que participe de la solicitud)

  @Patch(':id/reprogramar')
  @UseGuards(AuthGuard)
  reprogramar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.reprogramar(id, usuario);
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard)
  cancelar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.cancelar(id, usuario);
  }
}