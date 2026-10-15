import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(private readonly config: ConfigService) {
    const accessToken = config.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    console.info('[env] Variables detectadas:', Object.keys(process.env).join(', '));
    console.info('[env] MERCADOPAGO_ACCESS_TOKEN:', accessToken ? 'configurado' : 'falta');

    if (!accessToken) {
      throw new Error('Falta configurar MERCADOPAGO_ACCESS_TOKEN en manitas-backend/.env');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
    });
  }

  async createPreference(body: { title: string; price: number; quantity: number }) {
    const preference = new Preference(this.client);
    const backUrls = {
      success: this.config.get<string>('MERCADOPAGO_SUCCESS_URL', 'http://localhost:5173/success'),
      failure: this.config.get<string>('MERCADOPAGO_FAILURE_URL', 'http://localhost:5173/failure'),
      pending: this.config.get<string>('MERCADOPAGO_PENDING_URL', 'http://localhost:5173/pending'),
    };

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: '1',
              title: body.title,
              unit_price: Number(body.price),
              quantity: Number(body.quantity),
              currency_id: 'ARS',
            },
          ],
          back_urls: backUrls,
          ...(backUrls.success.startsWith('https://') && { auto_return: 'approved' as const }),
        },
      });

      return {
        init_point: response.init_point,
        preference_id: response.id,
      };
    } catch (error: any) {
      throw new Error(`Error al crear la preferencia: ${error.message}`);
    }
  }
}