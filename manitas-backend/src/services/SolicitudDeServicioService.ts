import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SolicitudDeServicio } from '../entities/SolicitudDeServicio';

@Injectable()
export class SolicitudDeServicioService {

    constructor(
        @InjectRepository(SolicitudDeServicio)
        private readonly solicituddeservicioRepository: Repository<SolicitudDeServicio>,
      ) {}

}