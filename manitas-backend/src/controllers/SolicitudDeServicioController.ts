import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { SolicitudDeServicio } from '../entities/SolicitudDeServicio';
import { SolicitudDeServicioService } from '../services/SolicitudDeServicioService';

@Controller('solicitudesdeservicio')
export class SolicitudDeServicioController {

 constructor(
    private readonly solicituddeservicioService: SolicitudDeServicioService,
  ) {}

  }
