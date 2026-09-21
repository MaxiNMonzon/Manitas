import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';

describe('SolicitudDeServicioService', () => {
  let service: SolicitudDeServicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudDeServicioService],
    }).compile();

    service = module.get<SolicitudDeServicioService>(SolicitudDeServicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
