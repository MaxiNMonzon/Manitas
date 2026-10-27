import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConsultaService } from './consulta.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Consultas (ayuda)')
@Controller('consulta')
export class ConsultaController {
  constructor(private readonly consultaService: ConsultaService) {}

  @Post()
  @ApiOperation({
    summary: 'Enviar una consulta',
    description:
      'Desde la seccion Ayuda, cuando las preguntas frecuentes no responden la duda. Publico (tambien sin sesion). ' +
      'Se guarda para que el administrador la lea y le escriba al correo indicado.',
  })
  @ApiBadRequestResponse({ description: 'Falta el correo, el tema o el mensaje (minimo 10 letras)' })
  create(@Body() dto: CreateConsultaDto) {
    return this.consultaService.create(dto);
  }

  @Get()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Ver las consultas', description: 'Solo el admin. Las sin responder primero.' })
  findAll() {
    return this.consultaService.findAll();
  }

  @Patch(':id/respondida')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Marcar una consulta como respondida', description: 'Solo el admin, despues de escribirle por correo.' })
  marcarRespondida(@Param('id', ParseIntPipe) id: number) {
    return this.consultaService.marcarRespondida(id);
  }
}
