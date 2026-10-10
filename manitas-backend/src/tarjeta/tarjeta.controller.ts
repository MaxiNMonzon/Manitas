import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TarjetaService } from './tarjeta.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

// Todo es del cliente y solo sobre sus propias tarjetas.
// No hay PATCH: si cambia la tarjeta, se borra y se agrega otra
@ApiTags('Tarjetas del cliente')
@Controller('tarjeta')
@Auth(Rol.CLIENTE)
export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar una tarjeta', description: 'Solo se guardan los ultimos 4 digitos y el vencimiento, nunca el numero completo ni el codigo de seguridad. No deja agregar tarjetas vencidas.' })
  create(@Body() createTarjetaDto: CreateTarjetaDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.create(createTarjetaDto, usuario.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Mis tarjetas', description: 'Las tarjetas del cliente logueado, con su metodo de pago.' })
  findAll(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.findAll(usuario.sub);
  }

  // Tiene que ir antes de ':id'
  @Get('promociones')
  @ApiOperation({ summary: 'Mis tarjetas con su promocion', description: 'Cada tarjeta con la mejor promo vigente hoy, para elegir con cual pagar.' })
  conPromociones(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.conPromociones(usuario.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una de mis tarjetas', description: 'Solo si es del cliente logueado.' })
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.findOne(id, usuario.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar una de mis tarjetas', description: 'Borrado logico: las solicitudes ya pagadas siguen sabiendo con que tarjeta se pagaron.' })
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.remove(id, usuario.sub);
  }
}
