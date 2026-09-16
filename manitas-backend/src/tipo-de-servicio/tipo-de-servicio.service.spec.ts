import { Test, TestingModule } from '@nestjs/testing';
import { TipoDeServicioService } from './tipo-de-servicio.service';

describe('TipoDeServicioService', () => {
  let service: TipoDeServicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoDeServicioService],
    }).compile();

    service = module.get<TipoDeServicioService>(TipoDeServicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
