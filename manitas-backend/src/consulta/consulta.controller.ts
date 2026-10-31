import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ConsultaService } from './consulta.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@ApiTags('Consultas (ayuda)')
@Controller('consulta')
export class ConsultaController {
  constructor(private readonly consultaService: ConsultaService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar una consulta',
    description:
      'Desde la seccion Ayuda, cuando las preguntas frecuentes no responden la duda. Cliente o profesional con sesion: ' +
      'el rol y el correo de la cuenta se toman del token. Se guarda para que el administrador la lea y le escriba al correo indicado.',
  })
  @ApiBadRequestResponse({ description: 'Falta el correo, el tema o el mensaje (minimo 10 letras)' })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'El administrador no envia consultas' })
  create(@Body() dto: CreateConsultaDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.consultaService.create(dto, usuario);
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
