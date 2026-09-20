import { Test, TestingModule } from '@nestjs/testing';
import { TiposDeServicioController } from './tipos-de-servicio.controller';
import { TiposDeServicioService } from './tipos-de-servicio.service';

describe('TiposDeServicioController', () => {
  let controller: TiposDeServicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposDeServicioController],
      providers: [TiposDeServicioService],
    }).compile();

    controller = module.get<TiposDeServicioController>(TiposDeServicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
