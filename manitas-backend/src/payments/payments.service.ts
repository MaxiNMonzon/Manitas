import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { SolicitudDeServicioService } from '../solicitud-de-servicio/solicitud-de-servicio.service';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

// Pago con Mercado Pago (Checkout Pro, en modo prueba / sandbox). Lo arranco Mica.
// Es la otra opcion para pagar, ademas de la tarjeta guardada (PATCH /solicitud-de-servicio/:id/pagar)
@Injectable()
export class PaymentsService {
  // Si no hay token en el .env queda en null: el server arranca igual y solo falla pagar con Mercado Pago
  private client: MercadoPagoConfig | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly solicitudService: SolicitudDeServicioService,
  ) {
    const accessToken = config.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    if (accessToken) {
      this.client = new MercadoPagoConfig({ accessToken });
    } else {
      console.warn('[Mercado Pago] Falta MERCADOPAGO_ACCESS_TOKEN en el .env: no se va a poder pagar con Mercado Pago');
    }
  }

  private clienteMercadoPago() {
    if (!this.client) {
      throw new ServiceUnavailableException('Mercado Pago no esta configurado (falta MERCADOPAGO_ACCESS_TOKEN en el .env del back)');
    }
    return this.client;
  }

  // Paso 1: arma el pago en Mercado Pago y devuelve el link para ir a pagar
  async createPreference(idSolicitud: number, usuario: UsuarioActivoInterface) {
    const client = this.clienteMercadoPago();
    // Las mismas reglas que pagar con tarjeta (es del cliente, se puede pagar, no esta pagada)
    const { solicitud, monto } = await this.solicitudService.montoAPagar(idSolicitud, usuario);

    // Al tocar "Volver al sitio", Mercado Pago vuelve a "Mis solicitudes" del front con
    // ?payment_id=...&status=...&external_reference=<idSolicitud>, y ahi se confirma el pago (POST /payments/confirmar)
    const vuelta = this.config.get<string>('MERCADOPAGO_VUELTA_URL', 'http://localhost:5173/app/solicitudes');
    const backUrls = {
      success: this.config.get<string>('MERCADOPAGO_SUCCESS_URL', vuelta),
      failure: this.config.get<string>('MERCADOPAGO_FAILURE_URL', vuelta),
      pending: this.config.get<string>('MERCADOPAGO_PENDING_URL', vuelta),
    };

    const especialidad = solicitud.especialidad?.nombreEspecialidad ?? 'Servicio';
    const titulo = solicitud.estadoServicio === 'rechazado' ? `Manitas - Visita de ${especialidad}` : `Manitas - ${especialidad}`;

    try {
      const response = await new Preference(client).create({
        body: {
          items: [
            {
              id: String(solicitud.idSolicitud),
              title: titulo,
              unit_price: monto,
              quantity: 1,
              currency_id: 'ARS',
            },
          ],
          // Con esto, al confirmar se sabe de que solicitud es el pago
          external_reference: String(solicitud.idSolicitud),
          // Sin auto_return: despues de pagar, el cliente toca "Volver al sitio" en Mercado Pago
          // y recien ahi vuelve a la app, que confirma el pago
          back_urls: backUrls,
        },
      });

      return {
        init_point: response.init_point,
        preference_id: response.id,
        monto,
      };
    } catch (error: any) {
      throw new BadRequestException(`Error al crear el pago en Mercado Pago: ${error.message ?? error}`);
    }
  }

  // Paso 2: al volver de Mercado Pago, el back le pregunta a Mercado Pago si el pago se aprobo
  // (no se le cree al front) y recien ahi marca la solicitud como pagada
  async confirmar(paymentId: string, usuario: UsuarioActivoInterface) {
    const client = this.clienteMercadoPago();

    const pago = await new Payment(client).get({ id: paymentId }).catch(() => null);
    if (!pago) {
      throw new BadRequestException('No se encontro ese pago en Mercado Pago');
    }

    const idSolicitud = Number(pago.external_reference);
    if (!idSolicitud) {
      throw new BadRequestException('Ese pago no es de una solicitud de Manitas');
    }

    // Si ya se confirmo antes (ej: recargaron la pantalla), se devuelve como esta
    const yaGuardada = await this.solicitudService.findOne(idSolicitud, usuario);
    if (yaGuardada.idPagoMercadoPago === String(pago.id)) {
      return { solicitud: yaGuardada, estadoPago: pago.status };
    }

    if (pago.status !== 'approved') {
      throw new BadRequestException(`El pago no fue aprobado (estado en Mercado Pago: ${pago.status})`);
    }

    const { solicitud, monto } = await this.solicitudService.montoAPagar(idSolicitud, usuario);
    if (Number(pago.transaction_amount) !== monto) {
      throw new BadRequestException('El monto pagado no coincide con el de la solicitud');
    }

    const guardada = await this.solicitudService.registrarPagoMercadoPago(solicitud, String(pago.id));
    return { solicitud: guardada, estadoPago: pago.status };
  }
}
