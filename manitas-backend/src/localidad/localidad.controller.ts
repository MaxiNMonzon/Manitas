import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { LocalidadService } from './localidad.service';
import { CreateLocalidadDto } from './dto/create-localidad.dto';
import { UpdateLocalidadDto } from './dto/update-localidad.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@Controller('localidad')
export class LocalidadController {
  constructor(private readonly localidadService: LocalidadService) {}

  @Post()
  @Auth(Rol.ADMIN)
  create(@Body() createLocalidadDto: CreateLocalidadDto) {
    return this.localidadService.create(createLocalidadDto);
  }

  @Get()
  findAll() {
    return this.localidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.localidadService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLocalidadDto: UpdateLocalidadDto) {
    return this.localidadService.update(id, updateLocalidadDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.localidadService.remove(id);
  }
}
