import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Especialidad } from '../entities/Especialidad';

@Injectable()
export class EspecialidadService {

    constructor(
        @InjectRepository(Especialidad)
        private readonly especialidadRepository: Repository<Especialidad>,
      ) {}

}