import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Promocion } from '../entities/Promocion';

@Injectable()
export class PromocionService {

    constructor(
        @InjectRepository(Promocion)
        private readonly promocionRepository: Repository<Promocion>,
      ) {}

}