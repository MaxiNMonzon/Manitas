import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MetodoDePagoService } from './metodo-de-pago.service';
import { CreateMetodoDePagoDto } from './dto/create-metodo-de-pago.dto';
import { UpdateMetodoDePagoDto } from './dto/update-metodo-de-pago.dto';

@Controller('metodo-de-pago')
export class MetodoDePagoController {
  constructor(private readonly metodoDePagoService: MetodoDePagoService) {}

  @Post()
  create(@Body() createMetodoDePagoDto: CreateMetodoDePagoDto) {
    return this.metodoDePagoService.create(createMetodoDePagoDto);
  }

  @Get()
  findAll() {
    return this.metodoDePagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metodoDePagoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetodoDePagoDto: UpdateMetodoDePagoDto) {
    return this.metodoDePagoService.update(+id, updateMetodoDePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metodoDePagoService.remove(+id);
  }
}
