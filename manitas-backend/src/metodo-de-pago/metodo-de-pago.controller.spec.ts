import { Test, TestingModule } from '@nestjs/testing';
import { MetodoDePagoController } from './metodo-de-pago.controller';
import { MetodoDePagoService } from './metodo-de-pago.service';

describe('MetodoDePagoController', () => {
  let controller: MetodoDePagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetodoDePagoController],
      providers: [MetodoDePagoService],
    }).compile();

    controller = module.get<MetodoDePagoController>(MetodoDePagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
