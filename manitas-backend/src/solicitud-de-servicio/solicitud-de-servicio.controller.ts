import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { AgendarDto } from './dto/agendar.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
import { PagarDto } from './dto/pagar.dto';
import { CalificarDto } from './dto/calificar.dto';
import { CreateUrgenteDto } from './dto/create-urgente.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

const ESTADO_INCORRECTO = 'La solicitud no esta en el estado que hace falta para este paso';

@ApiTags('Solicitudes de servicio')
@Controller('solicitud-de-servicio')
export class SolicitudDeServicioController {
  constructor(private readonly solicitudDeServicioService: SolicitudDeServicioService) {}

  @Post()
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Solicitar presupuesto',
    description: 'El cliente le pide un trabajo a un profesional, eligiendo la especialidad que necesita (el profesional tiene que hacerla) y contando el problema. Queda en estado "solicitado". El estado, las fechas y el costo de visita los pone el sistema.',
  })
  create(@Body() createSolicitudDeServicioDto: CreateSolicitudDeServicioDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.create(createSolicitudDeServicioDto, usuario.sub);
  }

  @Post('urgente')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Pedir un servicio urgente',
    description:
      'Sin elegir profesional: le aparece a todos los que hacen esa especialidad en la zona del cliente. ' +
      'El primero que acepta se la queda (pasa a en_coordinacion). Si nadie acepta en 1 hora, vence.',
  })
  crearUrgente(@Body() createUrgenteDto: CreateUrgenteDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.crearUrgente(createUrgenteDto, usuario.sub);
  }

  // Tiene que ir antes de ':id'
  @Get('urgentes')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Urgentes disponibles cerca',
    description: 'Las urgentes que nadie tomo todavia, de mis especialidades y en mis zonas. Del cliente solo se ve el nombre y la zona.',
  })
  urgentesDisponibles(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.urgentesDisponibles(usuario);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis solicitudes',
    description: 'Las del cliente o las del profesional logueado. Las que pasaron 48 hs sin respuesta (o sin fecha cargada) se marcan como "expirado".',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  findAll(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.findAll(usuario);
  }

  // Tiene que ir antes de ':id', si no Nest piensa que "avisos" es un id
  @Get('avisos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis avisos (notificaciones dentro de la app)',
    description:
      'Se arman en el momento segun quien pregunta. Profesional: solicitudes nuevas, fechas para cargar y visitas en las proximas 24 hs. ' +
      'Cliente: presupuestos recibidos, visitas proximas, pagos pendientes y profesionales para calificar.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  avisos(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.avisos(usuario);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver una solicitud', description: 'Con el cliente, el profesional y la tarjeta con la que se pago. Solo para quienes participan.' })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.findOne(id, usuario);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Corregir la descripcion del problema', description: 'Solo el cliente y solo mientras esta en "solicitado".' })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'Solo el cliente de la solicitud' })
  @ApiBadRequestResponse({ description: 'El profesional ya la acepto' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSolicitudDeServicioDto: UpdateSolicitudDeServicioDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.update(id, updateSolicitudDeServicioDto, usuario);
  }

  // Pasos del profesional

  @Patch(':id/aceptar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({ summary: 'Aceptar la solicitud', description: 'solicitado → en_coordinacion. Despues coordinan la visita por WhatsApp. Si es una urgente sin profesional, la puede aceptar cualquiera de esa especialidad y zona: el primero se la queda.' })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  aceptar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptar(id, usuario);
  }

  @Patch(':id/rechazar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({ summary: 'Rechazar la solicitud', description: 'solicitado → rechazado (por ejemplo, no hace ese trabajo).' })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  rechazar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazar(id, usuario);
  }

  @Patch(':id/agendar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Coordinar visita (cargar fecha y hora)',
    description: 'en_coordinacion → agendado. Si todavia no hay presupuesto aceptado es la fecha de la visita; si ya hay, es la del trabajo. La fecha tiene que ser futura.',
  })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, o la fecha ya paso` })
  agendar(@Param('id', ParseIntPipe) id: number, @Body() agendarDto: AgendarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.agendar(id, agendarDto, usuario);
  }

  @Patch(':id/presupuestar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Enviar presupuesto',
    description:
      'agendado → presupuestado. La primera vez guarda el presupuesto (costoEstimado). ' +
      'Si se usa de nuevo a mitad del trabajo es un cambio de precio: solo cambia costoFinal y el cliente lo tiene que volver a aceptar.',
  })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  presupuestar(@Param('id', ParseIntPipe) id: number, @Body() presupuestarDto: PresupuestarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.presupuestar(id, presupuestarDto, usuario);
  }

  // Pasos del cliente

  @Patch(':id/aceptar-presupuesto')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Confirmar servicio (aceptar el presupuesto)',
    description:
      'presupuestado → agendado (trabajo chico, se hace en el momento, o cambio de precio a mitad del trabajo) ' +
      'o → en_coordinacion (trabajo grande, hay que coordinar la fecha del trabajo).',
  })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  aceptarPresupuesto(@Param('id', ParseIntPipe) id: number, @Body() aceptarPresupuestoDto: AceptarPresupuestoDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptarPresupuesto(id, aceptarPresupuestoDto, usuario);
  }

  @Patch(':id/rechazar-presupuesto')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Rechazar el presupuesto',
    description: 'presupuestado → rechazado. Si el profesional cobra la visita, queda para pagar solo la visita.',
  })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  rechazarPresupuesto(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazarPresupuesto(id, usuario);
  }

  @Patch(':id/pagar')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Abonar servicio',
    description:
      'Con una tarjeta guardada del cliente. En "agendado" (trabajo ya empezado) pasa a finalizado; en "rechazado" paga solo la visita. ' +
      'Se cobra el precio completo: si la tarjeta tiene una promo vigente, la respuesta informa el reintegro que devuelve el banco.',
  })
  @ApiBadRequestResponse({ description: 'No hay nada para pagar, ya se pago, o la tarjeta no es valida (vencida, ajena o metodo inactivo)' })
  pagar(@Param('id', ParseIntPipe) id: number, @Body() pagarDto: PagarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.pagar(id, pagarDto, usuario);
  }

  @Patch(':id/calificar')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Calificar profesional', description: 'De 1 a 5 estrellas y una reseña opcional. Solo en "finalizado" y una sola vez.' })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, o ya fue calificada` })
  calificar(@Param('id', ParseIntPipe) id: number, @Body() calificarDto: CalificarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.calificar(id, calificarDto, usuario);
  }

  // Pasos de los dos (findOne ya controla que participe de la solicitud)

  @Patch(':id/reprogramar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reprogramar', description: 'agendado → en_coordinacion, para cargar otra fecha. Cliente o profesional.' })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  reprogramar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.reprogramar(id, usuario);
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancelar',
    description:
      'Cliente o profesional, en solicitado, en_coordinacion o agendado, mientras no haya un presupuesto aceptado. ' +
      'Si ya esta agendada la visita, hasta 12 hs antes. Una urgente solo se cancela mientras nadie la acepto.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: 'Ya no se puede cancelar (presupuesto aceptado, faltan menos de 12 hs o estado incorrecto)' })
  cancelar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.cancelar(id, usuario);
  }
}