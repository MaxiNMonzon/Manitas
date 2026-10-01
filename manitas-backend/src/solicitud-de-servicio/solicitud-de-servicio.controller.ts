import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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
  findAll() {
    return this.solicitudDeServicioService.findAll();
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
