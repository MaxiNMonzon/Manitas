import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Especialidades')
@Controller('especialidad')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear una especialidad', description: 'Solo el admin.' })
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadService.create(createEspecialidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar las especialidades', description: 'Publico.' })
  findAll() {
    return this.especialidadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una especialidad', description: 'Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar una especialidad', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEspecialidadDto: UpdateEspecialidadDto) {
    return this.especialidadService.update(id, updateEspecialidadDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar una especialidad', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.remove(id);
  }
}