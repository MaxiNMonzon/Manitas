import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDeServicioController } from './solicitud-de-servicio.controller';
import { SolicitudDeServicioService } from './solicitud-de-servicio.service';

describe('SolicitudDeServicioController', () => {
  let controller: SolicitudDeServicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudDeServicioController],
      providers: [SolicitudDeServicioService],
    }).compile();

    controller = module.get<SolicitudDeServicioController>(SolicitudDeServicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
