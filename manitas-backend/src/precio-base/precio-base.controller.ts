import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PrecioBaseService } from './precio-base.service';
import { CreatePrecioBaseDto } from './dto/create-precio-base.dto';
import { UpdatePrecioBaseDto } from './dto/update-precio-base.dto';

@Controller('precio-base')
export class PrecioBaseController {
  constructor(private readonly precioBaseService: PrecioBaseService) {}

  @Post()
  create(@Body() createPrecioBaseDto: CreatePrecioBaseDto) {
    return this.precioBaseService.create(createPrecioBaseDto);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePrecioBaseDto: UpdatePrecioBaseDto) {
    return this.precioBaseService.update(id, updatePrecioBaseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.precioBaseService.remove(id);
  }
}
