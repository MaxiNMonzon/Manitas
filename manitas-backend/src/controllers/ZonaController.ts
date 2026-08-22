import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Zona } from '../entities/Zona';
import { ZonaService } from '../services/ZonaService';

@Controller('zonas')
export class ZonaController {

 constructor(
    private readonly zonaService: ZonaService,
  ) {}

  }
