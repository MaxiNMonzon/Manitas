import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Localidad } from '../entities/Localidad';
import { LocalidadService } from '../services/LocalidadService';

@Controller('localidades')
export class LocalidadController {

  constructor(
    private readonly localidadService: LocalidadService,
  ) {}

  @Get()
  obtenerTodas(): Promise<Localidad[]> {
    return this.localidadService.obtenerTodas();
  }

  @Get(':id')
  obtenerPorId(
    @Param('id') id: string,
  ): Promise<Localidad> {
    return this.localidadService.obtenerPorId(Number(id));
  }

  @Post()
  agregar(
    @Body() localidad: Localidad,
  ): Promise<Localidad> {
    return this.localidadService.agregar(localidad);
  }

  @Put(':id')
  modificar(
    @Param('id') id: string,
    @Body() datos: Partial<Localidad>,
  ): Promise<Localidad> {
    return this.localidadService.modificar(
      Number(id),
      datos,
    );
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
  ): Promise<void> {
    return this.localidadService.eliminar(Number(id));
  }
}