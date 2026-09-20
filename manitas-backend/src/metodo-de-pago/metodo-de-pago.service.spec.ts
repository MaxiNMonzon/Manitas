import { Test, TestingModule } from '@nestjs/testing';
import { MetodoDePagoService } from './metodo-de-pago.service';

describe('MetodoDePagoService', () => {
  let service: MetodoDePagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetodoDePagoService],
    }).compile();

    service = module.get<MetodoDePagoService>(MetodoDePagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
