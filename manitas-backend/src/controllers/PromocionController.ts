import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Promocion } from '../entities/Promocion';
import { PromocionService } from '../services/PromocionService';

@Controller('promociones')
export class PromocionController {

 constructor(
    private readonly promocionService: PromocionService,
  ) {}

  }
