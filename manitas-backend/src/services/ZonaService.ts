import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Zona } from '../entities/Zona';

@Injectable()
export class ZonaService {

    constructor(
        @InjectRepository(Zona)
        private readonly zonaRepository: Repository<Zona>,
      ) {}

}