import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Controller('promocion')
export class PromocionController {
  constructor(private readonly promocionService: PromocionService) {}

  @Post()
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionService.create(createPromocionDto);
  }

  @Get()
  findAll() {
    return this.promocionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePromocionDto: UpdatePromocionDto) {
    return this.promocionService.update(id, updatePromocionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionService.remove(id);
  }
}
