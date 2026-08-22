import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetodoDePago } from '../entities/MetodoDePago';

@Injectable()
export class MetodoDePagoService {

    constructor(
        @InjectRepository(MetodoDePago)
        private readonly metododepagoRepository: Repository<MetodoDePago>,
      ) {}

}