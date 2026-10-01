import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';

@Controller('solicitud-de-servicio')
export class SolicitudDeServicioController {
  constructor(private readonly solicitudDeServicioService: SolicitudDeServicioService) {}

  @Post()
  create(@Body() createSolicitudDeServicioDto: CreateSolicitudDeServicioDto) {
    return this.solicitudDeServicioService.create(createSolicitudDeServicioDto);
  }

  @Get()
  findAll(
  @Query('cliente') cliente?: string,
  @Query('profesional') profesional?: string,
) {
  const idCliente = cliente ? +cliente : undefined;
  const idProfesional = profesional ? +profesional : undefined;
  return this.solicitudDeServicioService.findAll(idCliente, idProfesional);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDeServicioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto) {
    return this.solicitudDeServicioService.update(id, updateSolicitudDeServicioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDeServicioService.remove(id);
  }
}
