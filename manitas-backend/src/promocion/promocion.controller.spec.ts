import { Test, TestingModule } from '@nestjs/testing';
import { PromocionController } from './promocion.controller';
import { PromocionService } from './promocion.service';

describe('PromocionController', () => {
  let controller: PromocionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromocionController],
      providers: [PromocionService],
    }).compile();

    controller = module.get<PromocionController>(PromocionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
