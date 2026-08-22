import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Cliente } from '../entities/Cliente';
import { ClienteService } from '../services/ClienteService';

@Controller('clientes')
export class ClienteController {

 constructor(
    private readonly clienteService: ClienteService,
  ) {}

  }

