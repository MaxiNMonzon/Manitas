import { Test, TestingModule } from '@nestjs/testing';
import { PrecioBaseService } from './precio-base.service';

describe('PrecioBaseService', () => {
  let service: PrecioBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrecioBaseService],
    }).compile();

    service = module.get<PrecioBaseService>(PrecioBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});