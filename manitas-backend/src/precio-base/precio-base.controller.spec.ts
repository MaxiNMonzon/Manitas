import { Test, TestingModule } from '@nestjs/testing';
import { PrecioBaseController } from './precio-base.controller';
import { PrecioBaseService } from './precio-base.service';

describe('PrecioBaseController', () => {
  let controller: PrecioBaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrecioBaseController],
      providers: [PrecioBaseService],
    }).compile();

    controller = module.get<PrecioBaseController>(PrecioBaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
