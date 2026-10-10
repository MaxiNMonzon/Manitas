import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Zonas')
@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear una zona', description: 'Solo el admin.' })
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonaService.create(createZonaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar las zonas (con filtro)', description: 'Publico.' })
  @ApiQuery({ name: 'localidad', required: false, type: Number, description: 'id de la localidad' })
  findAll(@Query('localidad', new ParseIntPipe({ optional: true })) idLocalidad?: number) {
    return this.zonaService.findAll(idLocalidad);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una zona', description: 'Con su localidad y provincia. Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar una zona', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateZonaDto: UpdateZonaDto) {
    return this.zonaService.update(id, updateZonaDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar una zona', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.remove(id);
  }
}
