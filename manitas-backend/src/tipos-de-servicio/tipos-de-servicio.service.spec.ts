import { Test, TestingModule } from '@nestjs/testing';
import { TiposDeServicioService } from './tipos-de-servicio.service';

describe('TiposDeServicioService', () => {
  let service: TiposDeServicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposDeServicioService],
    }).compile();

    service = module.get<TiposDeServicioService>(TiposDeServicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
