import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { CalificarServicioDto } from './dto/calificar-servicio.dto';
import { CalificarProfesionalDto } from '../profesional/dto/calificar-profesional.dto';
import { SolicitarPresupuestoDto } from './dto/solicitar-presupuesto.dto';
import { EmitirPresupuestoDto } from './dto/emitir-presupuesto.dto';
import { AbonarServicioDto } from './dto/abonar-servicio.dto';
import { CoordinarVisitaDto } from './dto/coordinar-visita.dto';
import { SolicitarServicioDto } from './dto/solicitar-servicio.dto';
import { ConfirmarServicioDto } from './dto/confirmar-servicio.dto';

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

  @Patch(':id/calificar-servicio')
  calificarServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() calificarServicioDto: CalificarServicioDto,
  ) {
    return this.solicitudDeServicioService.calificarServicio(id, calificarServicioDto);
  }

  @Patch(':id/calificar-profesional')
  calificarProfesional(
    @Param('id', ParseIntPipe) id: number,
    @Body() calificarProfesionalDto: CalificarProfesionalDto,
  ) {
    return this.solicitudDeServicioService.calificarProfesional(id, calificarProfesionalDto);
  }

  @Get('profesional/:idProfesional/promedio')
  obtenerPromedioProfesional(@Param('idProfesional', ParseIntPipe) idProfesional: number) {
    return this.solicitudDeServicioService.obtenerPromedioProfesional(idProfesional);
  }
  @Post('solicitar-presupuesto')
  solicitarPresupuesto(@Body() solicitarPresupuestoDto: SolicitarPresupuestoDto) {
    return this.solicitudDeServicioService.solicitarPresupuesto(solicitarPresupuestoDto);
  }
  @Patch(':id/emitir-presupuesto')
  emitirPresupuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() emitirPresupuestoDto: EmitirPresupuestoDto,
  ) {
    return this.solicitudDeServicioService.emitirPresupuesto(id, emitirPresupuestoDto);
  }
  @Patch(':id/abonar')
  abonarServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() abonarServicioDto: AbonarServicioDto,
  ) {
    return this.solicitudDeServicioService.abonarServicio(id, abonarServicioDto);
  }
  @Patch(':id/coordinar-visita')
  coordinarVisita(
    @Param('id', ParseIntPipe) id: number,
    @Body() coordinarVisitaDto: CoordinarVisitaDto,
  ) {
    return this.solicitudDeServicioService.coordinarVisita(id, coordinarVisitaDto);
  }
  @Get('visitas/proximas')
  obtenerProximasVisitas(@Query('dias', new ParseIntPipe({ optional: true })) dias?: number) {
    return this.solicitudDeServicioService.obtenerProximasVisitas(dias ?? 1);
  }
  @Post('visitas/notificar-proximas')
  notificarProximasVisitas(@Query('dias', new ParseIntPipe({ optional: true })) dias?: number) {
    return this.solicitudDeServicioService.notificarProximasVisitas(dias ?? 1);
  }
  @Post('solicitar')
  solicitarServicio(@Body() solicitarServicioDto: SolicitarServicioDto) {
    return this.solicitudDeServicioService.solicitarServicio(solicitarServicioDto);
  }
  @Patch(':id/confirmar')
  confirmarServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmarServicioDto: ConfirmarServicioDto,
  ) {
    return this.solicitudDeServicioService.confirmarServicio(id, confirmarServicioDto);
  }
}