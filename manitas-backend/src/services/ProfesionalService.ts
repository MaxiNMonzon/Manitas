import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profesional } from '../entities/Profesional';

@Injectable()
export class ProfesionalService {

    constructor(
        @InjectRepository(Profesional)
        private readonly profesionalRepository: Repository<Profesional>,
      ) {}

}