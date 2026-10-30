import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { ReprogramarDto } from './dto/reprogramar.dto';
import { AceptarDto } from './dto/aceptar.dto';
import { AgendaQueryDto } from './dto/agenda-query.dto';
import { PresupuestarDto } from './dto/presupuestar.dto';
import { AceptarPresupuestoDto } from './dto/aceptar-presupuesto.dto';
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
    description: 'El cliente le pide un trabajo a un profesional: la especialidad que necesita (el profesional tiene que hacerla y trabajar en la zona del cliente), el problema y el turno de la visita (uno de los libres del profesional, ver GET /turnos/libres). El turno queda bloqueado. Queda en estado "solicitado"; el profesional tiene 48 hs (o hasta el turno) para responder.',
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
      'No usa turnos (es para ahora). El primero que acepta se la queda y dice en cuantos minutos llega (pasa a agendado). Si nadie acepta en 1 hora, vence.',
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

  // Tiene que ir antes de ':id'
  @Get('cobros')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Mis cobros (profesional)',
    description:
      'Los trabajos y visitas que cobro o tiene para cobrar, de lo mas nuevo a lo mas viejo. Cada uno con su estado: ' +
      'pendiente_cobro (el cliente todavia no pago, o pago y falta el deposito; fechaPago dice cual) o cobrado (ya depositado). ' +
      'El deposito se simula a los 3 dias habiles del pago. Del medio de pago se ve si fue con Mercado Pago. ' +
      'Tambien devuelve los ultimos 4 numeros del CBU/CVU donde se deposita (cuentaDeposito).',
  })
  cobros(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.cobros(usuario);
  }

  @Get('agenda')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mi agenda (calendario de visitas y trabajos)',
    description:
      'Las visitas y trabajos con fecha entre "desde" y "hasta" (incluidos, maximo 3 meses), ordenados por hora. ' +
      'Cada uno con inicio y fin estimado (si no se cargo la duracion, 1 hora), el estado y la otra persona. ' +
      'La direccion del cliente solo se le muestra al profesional. No incluye canceladas ni expiradas.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiBadRequestResponse({ description: 'Fechas mal escritas o rango de mas de 3 meses' })
  agenda(@Query() query: AgendaQueryDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.agenda(query, usuario);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver una solicitud',
    description: 'Con el cliente, el profesional, sus turnos reservados y, si hay una reprogramacion, los propuestos. Solo para quienes participan.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.detalle(id, usuario);
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
  @ApiOperation({
    summary: 'Aceptar la solicitud',
    description:
      'solicitado → agendado: la visita queda confirmada en el turno que eligio el cliente. ' +
      '(Si no puede en ese horario, puede proponer otro con "reprogramar".) ' +
      'Si es una urgente sin profesional, la puede aceptar cualquiera de esa especialidad y zona: el primero se la queda. ' +
      'Una urgente no usa turnos (es para ahora): hay que mandar minutosLlegada y la visita queda a esa hora; al cliente le llega el aviso de cuando llega.',
  })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, otro profesional ya tomo la urgente, o falta minutosLlegada en una urgente` })
  aceptar(@Param('id', ParseIntPipe) id: number, @Body() aceptarDto: AceptarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptar(id, aceptarDto, usuario);
  }

  @Patch(':id/rechazar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({ summary: 'Rechazar la solicitud', description: 'solicitado → rechazado (por ejemplo, no hace ese trabajo).' })
  @ApiBadRequestResponse({ description: ESTADO_INCORRECTO })
  rechazar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazar(id, usuario);
  }

  @Patch(':id/presupuestar')
  @Auth(Rol.PROFESIONAL)
  @ApiOperation({
    summary: 'Enviar presupuesto',
    description:
      'agendado → presupuestado, despues de la visita: el precio (costo) y cuantas horas lleva el trabajo (horasTrabajo, obligatorio). ' +
      'En contratado es un cambio de precio a mitad del trabajo: solo cambia costoFinal y el cliente lo tiene que volver a aceptar.',
  })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, todavia no fue la visita, o falta horasTrabajo` })
  presupuestar(@Param('id', ParseIntPipe) id: number, @Body() presupuestarDto: PresupuestarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.presupuestar(id, presupuestarDto, usuario);
  }

  // Pasos del cliente

  @Patch(':id/aceptar-presupuesto')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Confirmar servicio (aceptar el presupuesto)',
    description:
      'presupuestado → contratado. Con inicioTrabajo (un turno libre del profesional) el sistema reserva las horas seguidas del trabajo ' +
      '(si no entran en un dia, sigue el proximo que trabaja). Con enElMomento: true se hace ahora en la visita (si lleva hasta 1 hora). ' +
      'Si era un cambio de precio a mitad del trabajo, vuelve a contratado con el mismo horario.',
  })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, o falta elegir inicioTrabajo` })
  @ApiConflictResponse({ description: 'No entran las horas seguidas desde ese horario (dice cual es el proximo inicio posible)' })
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
  @ApiOperation({
    summary: 'Proponer otro horario (reprogramar)',
    description:
      'Se elige un turno libre del profesional (si es el trabajo, desde cuando arranca: se reservan las mismas horas seguidas). ' +
      '→ reprogramacion: el turno nuevo queda bloqueado, el original sigue reservado y le toca contestar al otro. ' +
      'Lo pueden hacer los dos en agendado o contratado, hasta 12 hs antes del turno; el profesional tambien en solicitado ' +
      '(para ofrecerle otro horario al cliente). En reprogramacion, el que tenia que contestar la usa para proponer otro (contrapropuesta).',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, faltan menos de 12 hs, o el horario no sirve` })
  @ApiConflictResponse({ description: 'El horario esta tomado o no entran las horas seguidas' })
  reprogramar(@Param('id', ParseIntPipe) id: number, @Body() reprogramarDto: ReprogramarDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.reprogramar(id, reprogramarDto, usuario);
  }

  @Patch(':id/aceptar-reprogramacion')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aceptar el horario propuesto',
    description: 'reprogramacion → agendado o contratado (vuelve a donde estaba), con el horario nuevo. Se libera el viejo. Solo el que no lo propuso.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, o el horario lo propusiste vos` })
  aceptarReprogramacion(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.aceptarReprogramacion(id, usuario);
  }

  @Patch(':id/rechazar-reprogramacion')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rechazar el horario propuesto',
    description: 'reprogramacion → vuelve al estado y al horario que tenia, como si no se hubiera propuesto nada. Solo el profesional, cuando el que propuso fue el cliente (si lo propuso el profesional es porque no puede en el original: el cliente acepta, propone otro o cancela).',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: `${ESTADO_INCORRECTO}, o el horario lo propusiste vos` })
  rechazarReprogramacion(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.rechazarReprogramacion(id, usuario);
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancelar',
    description:
      'Libera todos los turnos. Solicitado: el cliente (el profesional rechaza). Agendado: los dos, en cualquier momento. ' +
      'Contratado: el profesional siempre; el cliente solo dentro de las 6 hs de aceptar el presupuesto y antes de que arranque. ' +
      'Presupuestado no (el que no quiere, rechaza). Una urgente solo mientras nadie la acepto.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o es invalido' })
  @ApiForbiddenResponse({ description: 'No participas de esta solicitud' })
  @ApiBadRequestResponse({ description: 'Ya no se puede cancelar (paso el plazo, estado incorrecto o le corresponde rechazar)' })
  cancelar(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.solicitudDeServicioService.cancelar(id, usuario);
  }
}
