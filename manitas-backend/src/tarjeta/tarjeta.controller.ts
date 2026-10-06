import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TarjetaService } from './tarjeta.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

// Todo es del cliente y solo sobre sus propias tarjetas.
// No hay PATCH: si cambia la tarjeta, se borra y se agrega otra
@Controller('tarjeta')
@Auth(Rol.CLIENTE)
export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  @Post()
  create(@Body() createTarjetaDto: CreateTarjetaDto, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.create(createTarjetaDto, usuario.sub);
  }

  @Get()
  findAll(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.findAll(usuario.sub);
  }

  // Tiene que ir antes de ':id'
  @Get('promociones')
  conPromociones(@UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.conPromociones(usuario.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.findOne(id, usuario.sub);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.tarjetaService.remove(id, usuario.sub);
  }
}