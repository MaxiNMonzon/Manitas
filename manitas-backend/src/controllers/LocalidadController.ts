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

@Controller('localidades')
export class LocalidadController {

  private localidades: Localidad[] = [];

  @Get()
  obtenerLocalidades(): Localidad[] {
    return this.localidades;
  }

  @Get(':id')
  obtenerLocalidad(@Param('id') id: string): Localidad | undefined {
    return this.localidades.find(
      localidad => localidad.idLocalidad === Number(id)
    );
  }

  @Post()
  agregarLocalidad(@Body() localidad: Localidad): Localidad {
    this.localidades.push(localidad);
    return localidad;
  }

  @Put(':id')
  modificarLocalidad(
    @Param('id') id: string,
    @Body() datos: Localidad,
  ): Localidad | undefined {

    const localidad = this.localidades.find(
      localidad => localidad.idLocalidad === Number(id)
    );

    if (!localidad) {
      return undefined;
    }

    localidad.codigoPostal = datos.codigoPostal;
    localidad.nombreLocalidad = datos.nombreLocalidad;
    localidad.provincia = datos.provincia;

    return localidad;
  }

  @Delete(':id')
  eliminarLocalidad(
    @Param('id') id: string,
  ): Localidad | undefined {

    const indice = this.localidades.findIndex(
      localidad => localidad.idLocalidad === Number(id)
    );

    if (indice === -1) {
      return undefined;
    }

    return this.localidades.splice(indice, 1)[0];
  }
}