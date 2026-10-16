import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoService } from './turno.service';
import { GuardarHorarioDto } from './dto/guardar-horario.dto';
import { TurnosLibresQueryDto } from './dto/turnos-libres-query.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@ApiTags('Turnos')
@Controller('turnos')
export class TurnoController {
  constructor(private readonly turnoService: TurnoService) {}

  @Put('mi-horario')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Cargar mi horario fijo',
    description:
      'El profesional dice una sola vez que dias y en que horas trabaja (ej: lunes a viernes de 9 a 18). ' +
      'Reemplaza el horario anterior. Con esto se arman sus turnos de una hora. Los turnos ya tomados no se tocan.',
  })
  guardarHorario(@Body() dto: GuardarHorarioDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.turnoService.guardarHorario(usuario.sub, dto);
  }

  @Get('mi-horario')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({ summary: 'Ver mi horario fijo' })
  miHorario(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.turnoService.verHorario(usuario.sub);
  }

  @Get('horario/:idProfesional')
  @ApiOperation({ summary: 'Ver el horario fijo de un profesional', description: 'Publico.' })
  horario(@Param('idProfesional', ParseIntPipe) idProfesional: number) {
    return this.turnoService.verHorario(idProfesional);
  }

  @Get('libres/:idProfesional')
  @ApiOperation({
    summary: 'Turnos libres de un profesional (el calendario)',
    description:
      'Los turnos de una hora que el cliente puede elegir entre dos dias: el horario fijo del profesional ' +
      'menos los turnos ya tomados. Solo los que todavia no empezaron. Hasta 31 dias juntos. Publico.',
  })
  libres(@Param('idProfesional', ParseIntPipe) idProfesional: number, @Query() query: TurnosLibresQueryDto) {
    return this.turnoService.libres(idProfesional, query);
  }
}