import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { SolicitudDeServicioService } from '../solicitud-de-servicio/solicitud-de-servicio.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string, defaultValue?: string) =>
            key === 'MERCADOPAGO_ACCESS_TOKEN' ? 'test-access-token' : defaultValue,
          ) },
        },
        { provide: SolicitudDeServicioService, useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});