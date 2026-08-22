import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provincia } from '../entities/Provincia';

@Injectable()
export class ProvinciaService {

    constructor(
        @InjectRepository(Provincia)
        private readonly provinciaRepository: Repository<Provincia>,
      ) {}

}