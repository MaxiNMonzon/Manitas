import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query, //nuevo, para filtrado
} from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  @Post()
  create(@Body() createProfesionalDto: CreateProfesionalDto) {
    return this.profesionalService.create(createProfesionalDto);
  }

  @Get()    //lo nuevo del filtrado
  findAll(
  @Query('especialidad') especialidad?: string,
  @Query('zona') zona?: string,
) {
  const idEspecialidad = especialidad ? +especialidad : undefined;
  const idZona = zona ? +zona : undefined;
  return this.profesionalService.findAll(idEspecialidad, idZona);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesionalDto: UpdateProfesionalDto,
  ) {
    return this.profesionalService.update(id, updateProfesionalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.remove(id);
  }
}
