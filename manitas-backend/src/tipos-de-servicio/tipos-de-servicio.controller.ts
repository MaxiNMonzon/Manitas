import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TiposDeServicioService } from './tipos-de-servicio.service';
import { CreateTiposDeServicioDto } from './dto/create-tipos-de-servicio.dto';
import { UpdateTiposDeServicioDto } from './dto/update-tipos-de-servicio.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Tipos de servicio')
@Controller('tipos-de-servicio')
export class TiposDeServicioController {
  constructor(private readonly tiposDeServicioService: TiposDeServicioService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear un tipo de servicio', description: 'Solo el admin.' })
  create(@Body() createTiposDeServicioDto: CreateTiposDeServicioDto) {
    return this.tiposDeServicioService.create(createTiposDeServicioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar los tipos de servicio', description: 'Publico.' })
  findAll() {
    return this.tiposDeServicioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un tipo de servicio', description: 'Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposDeServicioService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar un tipo de servicio', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTiposDeServicioDto: UpdateTiposDeServicioDto) {
    return this.tiposDeServicioService.update(id, updateTiposDeServicioDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar un tipo de servicio', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposDeServicioService.remove(id);
  }
}
