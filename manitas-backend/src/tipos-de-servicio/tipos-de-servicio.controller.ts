import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';

@Controller('tipos-de-servicio')
export class TiposDeServicioController {
  constructor(private readonly tiposDeServicioService: TiposDeServicioService) {}

  @Post()
  create(@Body() createTiposDeServicioDto: CreateTiposDeServicioDto) {
    return this.tiposDeServicioService.create(createTiposDeServicioDto);
  }

  @Get()
  findAll() {
    return this.tiposDeServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposDeServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return this.tiposDeServicioService.update(+id, updateTiposDeServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposDeServicioService.remove(+id);
  }
}
