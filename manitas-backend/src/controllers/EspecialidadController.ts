import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Especialidad } from '../entities/Especialidad';
import { EspecialidadService } from '../services/EspecialidadService';

@Controller('especialidades')
export class EspecialidadController {

     constructor(
        private readonly especialidadService: EspecialidadService,
      ) {}

}