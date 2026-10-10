import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LocalidadService } from './localidad.service';
import { CreateLocalidadDto } from './dto/create-localidad.dto';
import { UpdateLocalidadDto } from './dto/update-localidad.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Localidades')
@Controller('localidad')
export class LocalidadController {
  constructor(private readonly localidadService: LocalidadService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear una localidad', description: 'Solo el admin.' })
  create(@Body() createLocalidadDto: CreateLocalidadDto) {
    return this.localidadService.create(createLocalidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar las localidades (con filtro)', description: 'Publico.' })
  @ApiQuery({ name: 'provincia', required: false, type: Number, description: 'id de la provincia' })
  findAll(@Query('provincia', new ParseIntPipe({ optional: true })) idProvincia?: number) {
    return this.localidadService.findAll(idProvincia);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una localidad', description: 'Con su provincia. Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.localidadService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar una localidad', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLocalidadDto: UpdateLocalidadDto) {
    return this.localidadService.update(id, updateLocalidadDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar una localidad', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.localidadService.remove(id);
  }
}
