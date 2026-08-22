import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { MetodoDePago } from '../entities/MetodoDePago';
import { MetodoDePagoService } from '../services/MetodoDePagoService';

@Controller('metodosdepago')
export class MetodoDePagoController {

 constructor(
    private readonly metododepagoService: MetodoDePagoService,
  ) {}

  }
