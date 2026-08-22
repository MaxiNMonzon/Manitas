import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { TipoDeServicio } from '../entities/TipoDeServicio';
import { TipoDeServicioService } from '../services/TipoDeServicioService';

@Controller('tiposdeservicio')
export class TipoDeServicioController {

 constructor(
    private readonly tipodeservicioService: TipoDeServicioService,
  ) {}

  }
