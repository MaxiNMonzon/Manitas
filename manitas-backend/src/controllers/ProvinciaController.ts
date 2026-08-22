import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Provincia } from '../entities/Provincia';
import { ProvinciaService } from '../services/ProvinciaService';

@Controller('provincias')
export class ProvinciaController {

 constructor(
    private readonly provinciaService: ProvinciaService,
  ) {}

  }
