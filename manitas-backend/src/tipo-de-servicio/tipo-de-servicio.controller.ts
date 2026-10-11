import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TipoDeServicioService } from './tipo-de-servicio.service';
import { CreateTipoDeServicioDto } from './dto/create-tipo-de-servicio.dto';
import { UpdateTipoDeServicioDto } from './dto/update-tipo-de-servicio.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Tipos de servicio')
@Controller('tipo-de-servicio')
export class TipoDeServicioController {
  constructor(private readonly tipoDeServicioService: TipoDeServicioService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear un tipo de servicio', description: 'Solo el admin.' })
  create(@Body() createTipoDeServicioDto: CreateTipoDeServicioDto) {
    return this.tipoDeServicioService.create(createTipoDeServicioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tipos de servicio por especialidad', description: 'Listado con filtro opcional: los trabajos que hace cada especialidad (ej: Plomeria → cambio de canilla, destapacion). Publico.' })
  @ApiQuery({ name: 'especialidad', required: false, type: Number, description: 'id de la especialidad' })
  findAll(@Query('especialidad', new ParseIntPipe({ optional: true })) idEspecialidad?: number) {
    return this.tipoDeServicioService.findAll(idEspecialidad);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un tipo de servicio', description: 'Con su especialidad y los profesionales que la hacen. Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDeServicioService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar un tipo de servicio', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTipoDeServicioDto: UpdateTipoDeServicioDto) {
    return this.tipoDeServicioService.update(id, updateTipoDeServicioDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar un tipo de servicio', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDeServicioService.remove(id);
  }
}
