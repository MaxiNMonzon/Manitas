import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@Controller('tipos-de-servicio')
export class TiposDeServicioController {
  constructor(private readonly tiposDeServicioService: TiposDeServicioService) {}

  @Post()
  @Auth(Rol.ADMIN)
  create(@Body() createTiposDeServicioDto: CreateTiposDeServicioDto) {
    return this.tiposDeServicioService.create(createTiposDeServicioDto);
  }

  @Get()
  findAll() {
    return this.tiposDeServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposDeServicioService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return this.tiposDeServicioService.update(id, updateTiposDeServicioDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposDeServicioService.remove(id);
  }
}
