import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonaService.create(createZonaDto);
  }

  @Get()
  findAll(@Query('localidad') localidad?: string) {
  const idLocalidad = localidad ? +localidad : undefined;
  return this.zonaService.findAll(idLocalidad);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateZonaDto: UpdateZonaDto,
  ) {
    return this.zonaService.update(id, updateZonaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.remove(id);
  }
}