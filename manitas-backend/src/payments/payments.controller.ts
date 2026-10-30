import { Controller, Post, Body } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CrearPreferenciaDto } from './dto/crear-preferencia.dto';
import { ConfirmarPagoDto } from './dto/confirmar-pago.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

const SIN_CONFIGURAR = 'Falta MERCADOPAGO_ACCESS_TOKEN en el .env del back';

@ApiTags('Pagos con Mercado Pago')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Ir a pagar con Mercado Pago',
    description:
      'El cliente paga con Mercado Pago (con tarjeta de credito, debito o saldo). Se puede pagar en "contratado" con el trabajo ya empezado, o la visita de un "rechazado". ' +
      'El precio sale de la solicitud. Devuelve el link (init_point) para ir a pagar al sitio de Mercado Pago (modo prueba).',
  })
  @ApiBadRequestResponse({ description: 'No hay nada para pagar, ya se pago, o fallo Mercado Pago' })
  @ApiServiceUnavailableResponse({ description: SIN_CONFIGURAR })
  createPreference(@Body() dto: CrearPreferenciaDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.paymentsService.createPreference(dto.idSolicitud, usuario);
  }

  @Post('confirmar')
  @Auth(Rol.CLIENTE)
  @ApiOperation({
    summary: 'Confirmar el pago al volver de Mercado Pago',
    description:
      'Se manda el payment_id que Mercado Pago pone en la direccion al volver. El back le pregunta a Mercado Pago si se aprobo ' +
      'y por cuanto; si esta todo bien: contratado → finalizado (o la visita del rechazado queda pagada).',
  })
  @ApiBadRequestResponse({ description: 'El pago no existe, no se aprobo, no es de esta solicitud o el monto no coincide' })
  @ApiServiceUnavailableResponse({ description: SIN_CONFIGURAR })
  confirmar(@Body() dto: ConfirmarPagoDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.paymentsService.confirmar(dto.paymentId, usuario);
  }
}
