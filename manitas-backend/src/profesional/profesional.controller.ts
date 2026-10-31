import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProfesionalService } from './profesional.service';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@ApiTags('Profesionales')
@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar profesionales', description: 'Listado con filtros opcionales y combinables. Cada profesional trae todas sus zonas y especialidades. Sin datos personales (DNI, correo, telefono, CBU).' })
  @ApiQuery({ name: 'especialidad', required: false, type: Number, description: 'id de la especialidad (ej: Plomeria)' })
  @ApiQuery({ name: 'zona', required: false, type: Number, description: 'id de la zona que cubre' })
  async findAll(
    @Query('especialidad', new ParseIntPipe({ optional: true })) idEspecialidad?: number,
    @Query('zona', new ParseIntPipe({ optional: true })) idZona?: number,
  ) {
    const profesionales = await this.profesionalService.findAll(idEspecialidad, idZona);
    return profesionales.map((p) => this.profesionalService.vistaPublica(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un profesional', description: 'Con sus zonas de cobertura y especialidades. Sin datos personales (DNI, correo, telefono, CBU).' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.vistaPublica(await this.profesionalService.findOne(id));
  }

  @Get(':id/calificaciones')
  @ApiOperation({ summary: 'Calificaciones de un profesional', description: 'Promedio, cantidad y reseñas (del cliente solo se muestra el nombre).' })
  calificaciones(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.calificaciones(id);
  }

  @Patch(':id')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Editar mi cuenta de profesional',
    description:
      'Si se mandan idsZonasCobertura, idsEspecialidades o matriculas, reemplazan a las que tenia (cada matricula tiene que ser de una de sus especialidades; ' +
      'si saca una especialidad, se van sus matriculas). El correo se puede cambiar si no lo usa otra cuenta (409).',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesionalDto: UpdateProfesionalDto,
    @UsuarioActivo() usuario: UsuarioActivoInterface,
  ) {
    return this.profesionalService.update(id, updateProfesionalDto, usuario.sub);
  }

  @Delete(':id')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({ summary: 'Dar de baja mi cuenta de profesional', description: 'Borrado logico: el correo queda bloqueado.' })
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.profesionalService.remove(id, usuario.sub);
  }
}