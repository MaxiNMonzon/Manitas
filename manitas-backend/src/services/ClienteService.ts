import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente } from '../entities/Cliente';

@Injectable()
export class ClienteService {

    constructor(
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
      ) {}

}