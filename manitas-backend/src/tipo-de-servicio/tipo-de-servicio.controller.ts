import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TipoDeServicioService } from './tipo-de-servicio.service';
import { CreateTipoDeServicioDto } from './dto/create-tipo-de-servicio.dto';
import { UpdateTipoDeServicioDto } from './dto/update-tipo-de-servicio.dto';

@Controller('tipo-de-servicio')
export class TipoDeServicioController {
  constructor(private readonly tipoDeServicioService: TipoDeServicioService) {}

  @Post()
  create(@Body() createTipoDeServicioDto: CreateTipoDeServicioDto) {
    return this.tipoDeServicioService.create(createTipoDeServicioDto);
  }

  @Get()
  findAll() {
    return this.tipoDeServicioService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDeServicioService.findOne(id);
  }


    @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTipoDeServicioDto: UpdateTipoDeServicioDto) {
    return this.tipoDeServicioService.update(id, updateTipoDeServicioDto);
  }


    @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDeServicioService.remove(id);
  }
}
//+id indica que una vez que se remueve un tipo de servicio, se busca o se edita un cierto valor
//de un atributo determinado, el id del tipo de servicio se hace autoincremental.