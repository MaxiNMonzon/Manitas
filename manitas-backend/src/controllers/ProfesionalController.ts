import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Profesional } from '../entities/Profesional';
import { ProfesionalService } from '../services/ProfesionalService';

@Controller('profesionales')
export class ProfesionalController {

 constructor(
    private readonly profesionalService: ProfesionalService,
  ) {}

  }
