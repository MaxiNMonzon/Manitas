import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { SolicitudDeServicioService } from '../solicitud-de-servicio/solicitud-de-servicio.service';
import { Rol } from '../common/enums/rol.enum';

// Se simula el SDK de Mercado Pago: el test no sale a internet.
// `pagoDeMercadoPago` es lo que "respondería" Mercado Pago al consultar el pago
let pagoDeMercadoPago: Record<string, unknown> | null = null;
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn(),
  Payment: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => (pagoDeMercadoPago ? Promise.resolve(pagoDeMercadoPago) : Promise.reject(new Error('404')))),
  })),
}));

describe('PaymentsService.confirmar (vuelta de Mercado Pago)', () => {
  let service: PaymentsService;
  const cliente = { sub: 12, correo: 'laura@test.com', rol: Rol.CLIENTE };
  const solicitud = { idSolicitud: 24, idPagoMercadoPago: null, costoFinal: 45000 };
  const solicitudService = {
    findOne: jest.fn(),
    montoAPagar: jest.fn(),
    registrarPagoMercadoPago: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'token-de-prueba';
    const modulo = await Test.createTestingModule({
      providers: [
        PaymentsService,
        ConfigService,
        { provide: SolicitudDeServicioService, useValue: solicitudService },
      ],
    }).compile();
    service = modulo.get(PaymentsService);

    solicitudService.findOne.mockResolvedValue(solicitud);
    // El monto sale de la base de datos, nunca del front
    solicitudService.montoAPagar.mockResolvedValue({ solicitud, monto: 45000 });
    solicitudService.registrarPagoMercadoPago.mockResolvedValue({ ...solicitud, estadoServicio: 'finalizado' });
  });

  it('registra el pago si Mercado Pago lo aprobó por el monto correcto', async () => {
    pagoDeMercadoPago = { id: 999, status: 'approved', external_reference: '24', transaction_amount: 45000 };

    const resultado = await service.confirmar('999', cliente);

    expect(solicitudService.registrarPagoMercadoPago).toHaveBeenCalledWith(solicitud, '999');
    expect(resultado.solicitud).toMatchObject({ estadoServicio: 'finalizado' });
  });

  it('no registra un pago que Mercado Pago no aprobó (aunque la URL diga approved)', async () => {
    pagoDeMercadoPago = { id: 999, status: 'rejected', external_reference: '24', transaction_amount: 45000 };

    await expect(service.confirmar('999', cliente)).rejects.toThrow('no fue aprobado');
    expect(solicitudService.registrarPagoMercadoPago).not.toHaveBeenCalled();
  });

  it('no registra un pago por un monto distinto al de la solicitud', async () => {
    pagoDeMercadoPago = { id: 999, status: 'approved', external_reference: '24', transaction_amount: 10 };

    await expect(service.confirmar('999', cliente)).rejects.toThrow('El monto pagado no coincide');
    expect(solicitudService.registrarPagoMercadoPago).not.toHaveBeenCalled();
  });

  it('si el pago ya estaba registrado no lo vuelve a registrar (recargar la página)', async () => {
    pagoDeMercadoPago = { id: 999, status: 'approved', external_reference: '24', transaction_amount: 45000 };
    solicitudService.findOne.mockResolvedValue({ ...solicitud, idPagoMercadoPago: '999' });

    await service.confirmar('999', cliente);
    expect(solicitudService.registrarPagoMercadoPago).not.toHaveBeenCalled();
  });

  it('rechaza un número de pago que no existe en Mercado Pago', async () => {
    pagoDeMercadoPago = null;
    await expect(service.confirmar('123', cliente)).rejects.toThrow(BadRequestException);
  });
});