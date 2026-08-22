import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TipoDeServicio } from '../entities/TipoDeServicio';

@Injectable()
export class TipoDeServicioService {

    constructor(
        @InjectRepository(TipoDeServicio)
        private readonly tipodeservicioRepository: Repository<TipoDeServicio>,
      ) {}

}